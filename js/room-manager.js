// ---------------------------------------------------------
// ROOM & MULTIPLAYER LOBBY CONTROLLER
// ---------------------------------------------------------
import { 
    db, saveRoomToDB, getRoomFromDB, getPublicRoomsFromDB, updateRoomInDB, subscribeToRoom,
    resolveProofQueryInRoom, authSignInAnonymous
} from './firebase.js';
import { questionDB } from './questions/questionDB.js';
import { state } from './state.js';
import { showToast, showScreen } from './ui.js';
import { getGeminiApiKey, evaluateProofStepWithGemini } from './gemini.js';
import { completeAuthentication } from './auth-controller.js';

let selectedTargetScore = 10;
let gameInstance = null;

export function setGameEngineInstance(instance) {
    gameInstance = instance;
}

export function getSelectedFormats() {
    return {
        mcq: document.getElementById('cb-format-mcq')?.checked ?? true,
        short_answer: document.getElementById('cb-format-short-ans')?.checked ?? true,
        multi_step: document.getElementById('cb-format-multi-step')?.checked ?? true,
        proofs: document.getElementById('cb-format-proofs')?.checked ?? true
    };
}

export function updateRoomNavLeaveButton() {
    const navLeaveBtn = document.getElementById('nav-btn-leave-room');
    if (navLeaveBtn) {
        if (state.currentRoomId) {
            navLeaveBtn.classList.remove('hidden');
        } else {
            navLeaveBtn.classList.add('hidden');
        }
    }
}

export async function ensureAuthenticatedSession() {
    if (!state.currentUser || !state.currentUser.uid) {
        try {
            const user = await authSignInAnonymous();
            await completeAuthentication({
                uid: user.uid,
                displayName: `Mathlete_${user.uid.slice(-4).toUpperCase()}`,
                email: null
            }, false);
            return true;
        } catch (e) {
            showToast("Please sign in before joining or creating a room.", true);
            showScreen('login');
            return false;
        }
    }
    return true;
}

export async function createRoom() {
    const authed = await ensureAuthenticatedSession();
    if (!authed) return;

    const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
    if (checkedTopics.length === 0) {
        showToast("Please select at least one curriculum topic.", true);
        return;
    }

    const formats = getSelectedFormats();
    if (!formats.mcq && !formats.short_answer && !formats.multi_step && !formats.proofs) {
        showToast("Please select at least one question format.", true);
        return;
    }

    const apiKey = getGeminiApiKey();
    if (formats.proofs && !apiKey) {
        showToast("Gemini API Key required to host Written Proofs. Set key in Profile or uncheck 'Written Proofs'.", true);
        return;
    }

    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    const initialRoom = {
        id: roomId,
        hostUid: state.currentUser.uid,
        status: 'waiting',
        settings: {
            targetScore: selectedTargetScore,
            topics: checkedTopics,
            formats: formats
        },
        players: {
            [state.currentUser.uid]: {
                displayName: state.userProfile.displayName || 'Host',
                avatar: state.userProfile.avatar || '🧮',
                elo: state.userProfile.elo || 1200,
                score: 0,
                isHost: true,
                isReady: true
            }
        },
        questions: [],
        pendingQueries: {},
        createdAt: Date.now()
    };

    try {
        showToast(`Creating room #${roomId}...`);
        await saveRoomToDB(roomId, initialRoom);
        enterRoom(roomId);
    } catch (e) {
        console.error("Failed to create room:", e);
        showToast("Room creation error: " + e.message, true);
    }
}

export async function joinRoom(roomId) {
    if (!roomId) return;
    const cleanRoomId = roomId.trim();

    const authed = await ensureAuthenticatedSession();
    if (!authed) return;

    try {
        showToast(`Joining room #${cleanRoomId}...`);
        const room = await getRoomFromDB(cleanRoomId);
        if (!room) {
            showToast(`Room #${cleanRoomId} not found on specrush. Check PIN and try again.`, true);
            return;
        }
        if (room.status !== 'waiting') {
            showToast("This match is already in progress.", true);
            return;
        }

        state.currentRoomId = cleanRoomId;
        updateRoomNavLeaveButton();

        // Update player entry in room
        await updateRoomInDB(cleanRoomId, {
            [`players.${state.currentUser.uid}`]: {
                displayName: state.userProfile.displayName || 'Player',
                avatar: state.userProfile.avatar || '🧮',
                elo: state.userProfile.elo || 1200,
                score: 0,
                isHost: (room.hostUid === state.currentUser.uid),
                isReady: (room.hostUid === state.currentUser.uid)
            }
        });

        enterRoom(cleanRoomId);
    } catch (e) {
        console.error("Join room error:", e);
        showToast("Failed to join room: " + e.message, true);
    }
}

export function enterRoom(roomId) {
    state.currentRoomId = roomId;
    updateRoomNavLeaveButton();

    if (state.roomUnsubscribe) {
        state.roomUnsubscribe();
        state.roomUnsubscribe = null;
    }

    state.roomUnsubscribe = subscribeToRoom(roomId, (data) => {
        state.roomData = data;
        handleRoomUpdate(data);
    }, (err) => {
        console.warn("Room listener note:", err);
    });

    const waitingTitle = document.getElementById('waiting-room-title');
    if (waitingTitle) waitingTitle.innerText = `ROOM #${roomId}`;

    showScreen('room-waiting');
}

export async function exitCurrentRoom() {
    const roomId = state.currentRoomId;
    const uid = state.currentUser?.uid;

    try {
        if (roomId && uid && roomId !== 'SOLO') {
            const patch = {};
            patch[`players.${uid}`] = null;
            await updateRoomInDB(roomId, patch);
        }
    } catch(e) {
        console.warn("Room exit sync error:", e);
    } finally {
        if (state.roomUnsubscribe) {
            state.roomUnsubscribe();
            state.roomUnsubscribe = null;
        }
        state.currentRoomId = null;
        state.roomData = null;
        updateRoomNavLeaveButton();
        showScreen('lobby');
        loadPublicRooms();
        showToast("Exited room.");
    }
}

export async function togglePlayerReady() {
    if (!state.currentRoomId || !state.currentUser?.uid || !state.roomData) return;
    const myPlayer = state.roomData.players?.[state.currentUser.uid];
    const currentReady = Boolean(myPlayer?.isReady);
    const newReady = !currentReady;

    try {
        await updateRoomInDB(state.currentRoomId, {
            [`players.${state.currentUser.uid}.isReady`]: newReady
        });
        showToast(newReady ? "You are ready!" : "Marked not ready.");
    } catch (e) {
        console.error("Failed to toggle ready state:", e);
    }
}

export async function kickPlayer(targetUid, targetName) {
    if (!state.currentRoomId || !state.currentUser?.uid) return;
    const isHost = state.roomData?.hostUid === state.currentUser.uid;
    if (!isHost || targetUid === state.currentUser.uid) return;

    try {
        const patch = {};
        patch[`players.${targetUid}`] = null;
        await updateRoomInDB(state.currentRoomId, patch);
        showToast(`Removed ${targetName} from the room.`);
    } catch (e) {
        console.error("Kick player error:", e);
        showToast("Failed to kick player: " + e.message, true);
    }
}

export function copyInviteLink() {
    const roomId = state.currentRoomId;
    if (!roomId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}#room=${roomId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("Invite link copied to clipboard!");
    }).catch(() => {
        showToast(`Invite PIN: ${roomId}`);
    });
}

export async function handleRoomUpdate(data) {
    if (!data) return;

    // HOST-DELEGATED QUERY PROCESSING LOOP
    const isHost = data.hostUid === state.currentUser?.uid;
    if (isHost && data.pendingQueries) {
        const queryEntries = Object.entries(data.pendingQueries);
        for (const [queryId, query] of queryEntries) {
            if (query && query.status === 'pending' && !state.processingQueryIds.has(queryId)) {
                state.processingQueryIds.add(queryId);
                evaluateProofStepWithGemini({
                    problemContext: query.problemContext,
                    stepPrompt: query.stepPrompt,
                    studentAnswer: query.studentAnswer,
                    expectedAnswerGuidelines: query.expectedAnswerGuidelines
                }).then(async (evalResult) => {
                    await resolveProofQueryInRoom(data.id, queryId, evalResult);
                    state.processingQueryIds.delete(queryId);
                }).catch(() => {
                    state.processingQueryIds.delete(queryId);
                });
            }
        }
    }

    // Filter out null/deleted player entries safely
    const playersWithUids = Object.entries(data.players || {})
        .filter(([_, p]) => Boolean(p))
        .map(([uid, p]) => ({ ...p, uid }));

    const playerCount = document.getElementById('waiting-player-count');
    if (playerCount) playerCount.innerText = playersWithUids.length;

    const targetScore = document.getElementById('waiting-target-score');
    if (targetScore) targetScore.innerText = `${data.settings?.targetScore || 10} Problems`;

    // Render Waiting Room Player List with Ready badges, Kick buttons, and Host indicators
    const playerListEl = document.getElementById('waiting-players-list');
    if (playerListEl) {
        playerListEl.innerHTML = '';
        playersWithUids.forEach(p => {
            const isMe = p.uid === state.currentUser?.uid;
            const isPlayerHost = p.uid === data.hostUid;
            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800";

            let readyBadge = '';
            if (isPlayerHost) {
                readyBadge = '<span class="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Host</span>';
            } else if (p.isReady) {
                readyBadge = '<span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Ready</span>';
            } else {
                readyBadge = '<span class="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Not Ready</span>';
            }

            let kickButtonHtml = '';
            if (isHost && !isPlayerHost && !isMe) {
                kickButtonHtml = `
                    <button class="btn-kick-player px-2 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/60 text-[10px] transition" data-uid="${p.uid}" data-name="${p.displayName}">
                        Kick
                    </button>
                `;
            }

            item.innerHTML = `
                <div class="flex items-center space-x-2.5">
                    <span class="text-lg">${p.avatar || '🧮'}</span>
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <span class="text-xs font-medium ${isMe ? 'text-indigo-400 font-semibold' : 'text-white'}">${p.displayName} ${isMe ? '(You)' : ''}</span>
                            ${readyBadge}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-mono text-xs text-indigo-400 font-medium">${p.elo || 1200}</span>
                    ${kickButtonHtml}
                </div>
            `;
            playerListEl.appendChild(item);
        });

        // Attach kick listeners
        playerListEl.querySelectorAll('.btn-kick-player').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                kickPlayer(btn.dataset.uid, btn.dataset.name);
            };
        });
    }

    // Host vs Non-Host Controls in Waiting Room
    const startBtn = document.getElementById('btn-start-game');
    const readyBtn = document.getElementById('btn-toggle-ready');
    const myPlayer = data.players?.[state.currentUser?.uid];

    if (startBtn) {
        startBtn.style.display = isHost ? 'flex' : 'none';
    }
    if (readyBtn) {
        readyBtn.style.display = isHost ? 'none' : 'flex';
        if (myPlayer?.isReady) {
            readyBtn.className = "px-5 py-2 rounded-lg font-medium bg-amber-600 hover:bg-amber-500 text-white text-xs transition";
            readyBtn.innerText = "Cancel Ready";
        } else {
            readyBtn.className = "px-5 py-2 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition";
            readyBtn.innerText = "Ready Up";
        }
    }

    // Transition to Active Game Screen
    if (data.status === 'in_game' && document.getElementById('screen-game')?.classList.contains('hidden')) {
        if (gameInstance) {
            gameInstance.startMatch({
                questions: data.questions,
                targetScore: data.settings?.targetScore || 10,
                roomId: data.id,
                isSolo: false
            });
        }
    }

    // Live In-Game Progress Bars
    if (data.status === 'in_game' && !document.getElementById('screen-game')?.classList.contains('hidden')) {
        const container = document.getElementById('live-progress-bars-container');
        if (container) {
            container.innerHTML = '';
            const sorted = playersWithUids.sort((a, b) => (b.score || 0) - (a.score || 0));
            sorted.forEach(p => {
                const pct = Math.min(100, Math.round(((p.score || 0) / (data.settings?.targetScore || 10)) * 100));
                const isMe = p.uid === state.currentUser?.uid;

                const bar = document.createElement('div');
                bar.className = "space-y-0.5";
                bar.innerHTML = `
                    <div class="flex justify-between text-[11px]">
                        <span class="${isMe ? 'text-indigo-400 font-semibold' : 'text-slate-300'}">${p.avatar || '🧮'} ${p.displayName} ${isMe ? '(You)' : ''}</span>
                        <span class="font-mono ${isMe ? 'text-indigo-400' : 'text-slate-400'}">${p.score || 0} / ${data.settings?.targetScore || 10}</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${pct}%;"></div>
                    </div>
                `;
                container.appendChild(bar);
            });
        }

        const target = data.settings?.targetScore || 10;
        const winner = playersWithUids.find(p => (p.score || 0) >= target);
        if (winner && document.getElementById('screen-results')?.classList.contains('hidden')) {
            if (gameInstance) {
                gameInstance.concludeMatch();
            }
        }
    }
}

export async function startGameMatch() {
    if (!state.currentRoomId || !state.roomData) return;
    const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
    const activeTopics = (checkedTopics && checkedTopics.length > 0) ? checkedTopics : state.roomData.settings?.topics;
    const activeFormats = state.roomData.settings?.formats || getSelectedFormats();

    const generated = questionDB.generateMatchSet(activeTopics, 50, activeFormats);
    await updateRoomInDB(state.currentRoomId, {
        status: 'in_game',
        questions: generated,
        'settings.topics': activeTopics,
        'settings.formats': activeFormats
    });
}

export async function loadPublicRooms() {
    const container = document.getElementById('rooms-list-container');
    const countLabel = document.getElementById('rooms-count-label');
    if (!container || !countLabel) return;

    try {
        const roomList = await getPublicRoomsFromDB();
        countLabel.innerText = `${roomList.length} room${roomList.length === 1 ? '' : 's'} available`;
        container.innerHTML = '';

        if (roomList.length === 0) {
            container.innerHTML = `<div class="p-4 text-center text-xs text-slate-500 italic">No public matches active. Create one to get started.</div>`;
            return;
        }

        roomList.forEach(room => {
            const playerCount = Object.keys(room.players || {}).filter(k => room.players[k]).length;
            const card = document.createElement('div');
            card.className = "glass-card p-3 rounded-lg border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between transition cursor-pointer";
            card.innerHTML = `
                <div class="space-y-0.5">
                    <div class="flex items-center space-x-2">
                        <span class="font-mono font-semibold text-white text-xs">PIN: ${room.id}</span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">First to ${room.settings?.targetScore || 10}</span>
                    </div>
                    <p class="text-[11px] text-slate-400">Topics: ${(room.settings?.topics || []).slice(0, 3).join(', ')}...</p>
                </div>
                <button class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition">
                    Join (${playerCount})
                </button>
            `;
            card.onclick = () => joinRoom(room.id);
            container.appendChild(card);
        });
    } catch (e) {
        console.warn("loadPublicRooms note:", e);
    }
}

export function setupLobbyEventListeners() {
    document.querySelectorAll('.target-score-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.target-score-btn').forEach(b => {
                b.className = "target-score-btn px-3.5 py-1.5 rounded-lg text-xs font-medium glass-button text-slate-300";
            });
            btn.className = "target-score-btn px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white";
            selectedTargetScore = parseInt(btn.dataset.score, 10);
        });
    });

    document.getElementById('btn-toggle-all-topics')?.addEventListener('click', () => {
        const cbs = document.querySelectorAll('.topic-cb');
        const anyChecked = Array.from(cbs).some(cb => cb.checked);
        cbs.forEach(cb => cb.checked = !anyChecked);
    });

    document.getElementById('btn-create-room')?.addEventListener('click', createRoom);

    document.getElementById('btn-join-room-code')?.addEventListener('click', async () => {
        const code = document.getElementById('input-room-code')?.value.trim();
        if (!code || code.length !== 6) {
            showToast("Enter a valid 6-digit room PIN.", true);
            return;
        }
        await joinRoom(code);
    });

    document.getElementById('input-room-code')?.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const code = document.getElementById('input-room-code')?.value.trim();
            if (code && code.length === 6) {
                await joinRoom(code);
            }
        }
    });

    document.getElementById('btn-start-game')?.addEventListener('click', startGameMatch);
    document.getElementById('btn-toggle-ready')?.addEventListener('click', togglePlayerReady);
    document.getElementById('btn-copy-invite-link')?.addEventListener('click', copyInviteLink);

    document.getElementById('btn-leave-room')?.addEventListener('click', exitCurrentRoom);
    document.getElementById('btn-leave-room-top')?.addEventListener('click', exitCurrentRoom);
    document.getElementById('btn-game-leave')?.addEventListener('click', exitCurrentRoom);
}
