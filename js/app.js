// ---------------------------------------------------------
// WACE MATH RUSH - MAIN APPLICATION ENTRY POINT
// ---------------------------------------------------------
import { 
    loadSavedProfile, saveLocalProfile, clearLocalProfile, getInitialStats,
    isFirebaseAvailable, auth, db,
    authSignInAnonymous, authSignInEmail, authSignInGoogle, authSignOut,
    syncUserProfileWithFirestore,
    saveRoomToDB, getRoomFromDB, getPublicRoomsFromDB, updateRoomInDB, subscribeToRoom,
    resolveProofQueryInRoom, doc, getDoc
} from './firebase.js';
import { questionDB } from './questions/questionDB.js';
import { GameEngine } from './game.js';
import { 
    showToast, showScreen, renderProfileDashboard, updateNavbarProfileBadge, 
    AVAILABLE_AVATARS, initScratchpad 
} from './ui.js';
import { setGeminiApiKey, getGeminiApiKey, evaluateProofStepWithGemini } from './gemini.js';

// Application State Object
const savedProfile = loadSavedProfile();
const state = {
    userProfile: savedProfile || {
        uid: null,
        displayName: 'Mathlete',
        avatar: '🧮',
        elo: 1200,
        isGuest: false,
        stats: getInitialStats()
    },
    currentUser: savedProfile ? {
        uid: savedProfile.uid,
        displayName: savedProfile.displayName,
        isGuest: Boolean(savedProfile.isGuest)
    } : null,
    currentRoomId: null,
    roomUnsubscribe: null,
    roomData: null,
    processingQueryIds: new Set()
};

// Initialize Game Engine
const game = new GameEngine(state);

// ---------------------------------------------------------
// DOM EVENT LISTENERS & ROUTING
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initScratchpad();
    setupAvatarPicker();
    setupLobbyControls();
    setupAuthHandlers();

    if (savedProfile && state.currentUser) {
        updateNavbarProfileBadge(state.userProfile);
        updateCloudStatusBadge();
        showScreen('landing');
    } else {
        // First Launch: Render First-Launch Authentication Screen
        showScreen('login');
    }
});

function updateCloudStatusBadge() {
    const badge = document.getElementById('nav-cloud-status');
    const label = document.getElementById('nav-cloud-label');
    if (!badge || !label) return;

    if (isFirebaseAvailable) {
        badge.className = "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        label.innerText = "specrush Cloud";
    } else {
        badge.className = "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20";
        label.innerText = "Offline Mode";
    }
}

function updateRoomNavLeaveButton() {
    const navLeaveBtn = document.getElementById('nav-btn-leave-room');
    if (navLeaveBtn) {
        if (state.currentRoomId) {
            navLeaveBtn.classList.remove('hidden');
        } else {
            navLeaveBtn.classList.add('hidden');
        }
    }
}

// ---------------------------------------------------------
// FIRST-LAUNCH AUTHENTICATION HANDLERS (4 MODES)
// ---------------------------------------------------------
function setupAuthHandlers() {
    let isEmailRegisterMode = false;

    // Toggle between Sign In and Register
    document.getElementById('btn-toggle-email-auth-mode')?.addEventListener('click', () => {
        isEmailRegisterMode = !isEmailRegisterMode;
        const toggleBtn = document.getElementById('btn-toggle-email-auth-mode');
        const submitBtn = document.getElementById('btn-submit-email-auth');
        if (isEmailRegisterMode) {
            if (toggleBtn) toggleBtn.innerText = "Already have an account? Sign In";
            if (submitBtn) submitBtn.innerText = "Create Account & Sign In";
        } else {
            if (toggleBtn) toggleBtn.innerText = "Need an account? Register";
            if (submitBtn) submitBtn.innerText = "Sign In with Email";
        }
    });

    // 1. Anonymous Authentication
    document.getElementById('btn-auth-anonymous')?.addEventListener('click', async () => {
        try {
            showToast("Connecting to specrush cloud...");
            const user = await authSignInAnonymous();
            completeAuthentication({
                uid: user.uid,
                displayName: `Mathlete_${user.uid.slice(-4).toUpperCase()}`,
                email: null,
                isGuest: false
            });
            showToast("✅ Connected anonymously!");
        } catch (err) {
            console.error("Anonymous auth error:", err);
            showToast("Auth note: " + (err.message || "Failed to authenticate"), true);
        }
    });

    // 2. Google Authentication
    document.getElementById('btn-google-login')?.addEventListener('click', async () => {
        try {
            showToast("Authenticating with Google...");
            const user = await authSignInGoogle();
            completeAuthentication({
                uid: user.uid,
                displayName: user.displayName || 'Google Mathlete',
                email: user.email,
                isGuest: false
            });
            showToast(`Welcome, ${user.displayName || 'Mathlete'}!`);
        } catch (err) {
            console.error("Google Auth error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                showToast("Domain not yet authorized in Firebase Console. You can use Anonymous or Guest mode!", true);
            } else if (err.code === 'auth/popup-blocked') {
                showToast("Popup blocked by browser. Please allow popups.", true);
            } else {
                showToast("Google Auth: " + (err.message || "Failed to sign in"), true);
            }
        }
    });

    // 3. Email Authentication
    document.getElementById('form-email-auth')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('input-auth-email')?.value.trim();
        const password = document.getElementById('input-auth-password')?.value;
        if (!email || !password) return;

        try {
            showToast(isEmailRegisterMode ? "Creating account..." : "Signing in...");
            const user = await authSignInEmail(email, password, isEmailRegisterMode);
            completeAuthentication({
                uid: user.uid,
                displayName: email.split('@')[0],
                email: email,
                isGuest: false
            });
            showToast(isEmailRegisterMode ? "Account created successfully!" : "Signed in successfully!");
        } catch (err) {
            console.error("Email auth error:", err);
            showToast("Email Auth: " + (err.message || "Authentication failed"), true);
        }
    });

    // 4. Guest Mode
    document.getElementById('form-guest-login')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-guest-name')?.value.trim() || 'Guest Mathlete';
        const guestUid = 'guest_' + Math.random().toString(36).substr(2, 9);
        completeAuthentication({
            uid: guestUid,
            displayName: name,
            email: null,
            isGuest: true
        });
        showToast(`Playing as ${name} (Guest)`);
    });

    // Sign Out Handler
    document.getElementById('profile-btn-logout')?.addEventListener('click', async () => {
        await authSignOut();
        state.currentUser = null;
        state.userProfile = {
            uid: null,
            displayName: 'Sign In',
            avatar: '🧮',
            elo: 1200,
            isGuest: false,
            stats: getInitialStats()
        };
        updateNavbarProfileBadge(state.userProfile);
        showToast("Signed out.");
        showScreen('login');
    });
}

async function completeAuthentication(userObj) {
    state.currentUser = userObj;
    state.userProfile = {
        uid: userObj.uid,
        displayName: userObj.displayName,
        avatar: '🧮',
        elo: 1200,
        isGuest: userObj.isGuest,
        stats: getInitialStats()
    };

    // Sync / Load existing statistics from Firestore if available
    if (db && !userObj.isGuest) {
        try {
            await syncUserProfileWithFirestore(userObj, userObj.displayName, userObj.isGuest);
            const userDoc = await getDoc(doc(db, 'users', userObj.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                state.userProfile.elo = data.elo || 1200;
                state.userProfile.avatar = data.avatar || '🧮';
                state.userProfile.stats = data.stats || getInitialStats();
            }
        } catch(e) {
            console.warn("Firestore profile sync note:", e);
        }
    }

    saveLocalProfile(state.userProfile);
    updateNavbarProfileBadge(state.userProfile);
    updateCloudStatusBadge();
    showScreen('lobby');
    loadPublicRooms();
}

// Top Navigation
document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
    if (state.currentUser) showScreen('landing');
    else showScreen('login');
});
document.getElementById('nav-btn-landing')?.addEventListener('click', () => {
    if (state.currentUser) showScreen('landing');
    else showScreen('login');
});
document.getElementById('nav-btn-lobby')?.addEventListener('click', () => {
    if (state.currentUser) {
        showScreen('lobby');
        loadPublicRooms();
    } else {
        showScreen('login');
    }
});
document.getElementById('nav-btn-profile')?.addEventListener('click', () => {
    if (state.currentUser) {
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    } else {
        showScreen('login');
    }
});
document.getElementById('nav-btn-leave-room')?.addEventListener('click', exitCurrentRoom);

// Landing Page Hero CTA
document.getElementById('landing-btn-start-playing')?.addEventListener('click', () => {
    if (state.currentUser) {
        showScreen('lobby');
        loadPublicRooms();
    } else {
        showScreen('login');
    }
});
document.getElementById('landing-btn-view-profile')?.addEventListener('click', () => {
    if (state.currentUser) {
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    } else {
        showScreen('login');
    }
});
document.getElementById('profile-btn-play')?.addEventListener('click', () => {
    showScreen('lobby');
    loadPublicRooms();
});

// Gemini API Key Save Button in Profile Settings
document.getElementById('btn-save-gemini-key')?.addEventListener('click', () => {
    const key = document.getElementById('input-gemini-key')?.value.trim();
    setGeminiApiKey(key);
    if (key) {
        showToast("✅ Gemini AI Proof Grader Activated (Flash + Flash-Lite Fallback)!");
    } else {
        showToast("Gemini API Key removed.");
    }
});

// ---------------------------------------------------------
// AVATAR PICKER
// ---------------------------------------------------------
function setupAvatarPicker() {
    const avatarGrid = document.getElementById('avatar-options-grid');
    if (!avatarGrid) return;
    avatarGrid.innerHTML = '';
    AVAILABLE_AVATARS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = "w-10 h-10 rounded-xl glass-button text-xl flex items-center justify-center hover:scale-110 transition";
        btn.innerText = emoji;
        btn.onclick = async () => {
            state.userProfile.avatar = emoji;
            saveLocalProfile(state.userProfile);
            const avatarDisplay = document.getElementById('profile-avatar-display');
            if (avatarDisplay) avatarDisplay.innerText = emoji;
            updateNavbarProfileBadge(state.userProfile);
            document.getElementById('avatar-picker-container')?.classList.add('hidden');
            showToast(`Avatar updated to ${emoji}`);
            
            if (db && state.currentUser && !state.currentUser.isGuest) {
                try {
                    await updateDoc(doc(db, 'users', state.currentUser.uid), { avatar: emoji });
                } catch(e) {}
            }
        };
        avatarGrid.appendChild(btn);
    });

    document.getElementById('btn-open-avatar-picker')?.addEventListener('click', () => {
        document.getElementById('avatar-picker-container')?.classList.toggle('hidden');
    });
    document.getElementById('btn-close-avatar-picker')?.addEventListener('click', () => {
        document.getElementById('avatar-picker-container')?.classList.add('hidden');
    });
}

// ---------------------------------------------------------
// LOBBY & ROOM CONTROLS
// ---------------------------------------------------------
let selectedTargetScore = 10;

function getSelectedFormats() {
    return {
        mcq: document.getElementById('cb-format-mcq')?.checked ?? true,
        short_answer: document.getElementById('cb-format-short-ans')?.checked ?? true,
        multi_step: document.getElementById('cb-format-multi-step')?.checked ?? true,
        proofs: document.getElementById('cb-format-proofs')?.checked ?? true
    };
}

function setupLobbyControls() {
    document.querySelectorAll('.target-score-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.target-score-btn').forEach(b => {
                b.className = "target-score-btn px-4 py-2 rounded-xl text-xs font-bold glass-button text-slate-300";
            });
            btn.className = "target-score-btn px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white";
            selectedTargetScore = parseInt(btn.dataset.score, 10);
        });
    });

    document.getElementById('btn-toggle-all-topics')?.addEventListener('click', () => {
        const cbs = document.querySelectorAll('.topic-cb');
        const anyChecked = Array.from(cbs).some(cb => cb.checked);
        cbs.forEach(cb => cb.checked = !anyChecked);
    });

    // Create Room
    document.getElementById('btn-create-room')?.addEventListener('click', async () => {
        if (!state.currentUser || !state.currentUser.uid) {
            showToast("Please sign in or select guest mode to create a room.", true);
            showScreen('login');
            return;
        }

        const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
        if (checkedTopics.length === 0) {
            showToast("Please select at least one topic for your lobby!", true);
            return;
        }

        const formats = getSelectedFormats();
        if (!formats.mcq && !formats.short_answer && !formats.multi_step && !formats.proofs) {
            showToast("Please select at least one question format type!", true);
            return;
        }

        const apiKey = getGeminiApiKey();
        if (formats.proofs && !apiKey) {
            showToast("⚠️ Gemini API Key required to host Rigorous Proofs! Set key in Profile or uncheck 'Rigorous Long Proofs' to host without key.", true);
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
                    displayName: state.userProfile.displayName,
                    avatar: state.userProfile.avatar,
                    elo: state.userProfile.elo,
                    score: 0,
                    isHost: true
                }
            },
            questions: [],
            pendingQueries: {},
            createdAt: Date.now()
        };

        try {
            await saveRoomToDB(roomId, initialRoom);
            enterRoom(roomId);
        } catch (e) {
            console.error("Failed to create room:", e);
            showToast("Room creation error: " + e.message, true);
        }
    });

    // Join by PIN
    document.getElementById('btn-join-room-code')?.addEventListener('click', async () => {
        const code = document.getElementById('input-room-code')?.value.trim().toUpperCase();
        if (!code || code.length !== 6) {
            showToast("Enter a valid 6-digit room PIN", true);
            return;
        }
        try {
            const room = await getRoomFromDB(code);
            if (!room) {
                showToast("Room not found on Firebase!", true);
                return;
            }
            if (room.status !== 'waiting') {
                showToast("This match is already in progress.", true);
                return;
            }
            await joinRoom(code);
        } catch (e) {
            showToast("Join error: " + e.message, true);
        }
    });

    // Solo Practice Run
    document.getElementById('btn-start-solo-practice')?.addEventListener('click', () => {
        const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
        const activeTopics = checkedTopics.length > 0 ? checkedTopics : null;
        const formats = getSelectedFormats();

        if (!formats.mcq && !formats.short_answer && !formats.multi_step && !formats.proofs) {
            showToast("Please select at least one question format!", true);
            return;
        }

        state.currentRoomId = null;
        updateRoomNavLeaveButton();
        const questions = questionDB.generateMatchSet(activeTopics, 40, formats);

        const progressContainer = document.getElementById('live-progress-bars-container');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div class="space-y-1">
                    <div class="flex justify-between text-xs">
                        <span class="font-bold text-slate-200">${state.userProfile.avatar} ${state.userProfile.displayName} (Solo)</span>
                        <span class="font-mono text-indigo-400 font-bold" id="solo-live-score">0 / ${selectedTargetScore}</span>
                    </div>
                    <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div id="solo-live-bar" class="h-full bg-indigo-500 transition-all duration-300" style="width: 0%;"></div>
                    </div>
                </div>
            `;
        }

        game.startMatch({
            questions: questions,
            targetScore: selectedTargetScore,
            roomId: 'SOLO',
            isSolo: true
        });
    });

    // Submissions
    document.getElementById('btn-submit-short-ans')?.addEventListener('click', () => game.submitShortAnswer());
    document.getElementById('short-answer-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') game.submitShortAnswer();
    });

    // Long Proof Submission
    document.getElementById('btn-submit-long-proof')?.addEventListener('click', () => game.submitLongAnswerProof());

    // Rematch & Results
    document.getElementById('results-btn-rematch')?.addEventListener('click', () => {
        state.currentRoomId = null;
        updateRoomNavLeaveButton();
        showScreen('lobby');
        loadPublicRooms();
    });
    document.getElementById('results-btn-profile')?.addEventListener('click', () => {
        state.currentRoomId = null;
        updateRoomNavLeaveButton();
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    });

    // Exit Room Buttons
    document.getElementById('btn-leave-room')?.addEventListener('click', exitCurrentRoom);
    document.getElementById('btn-leave-room-top')?.addEventListener('click', exitCurrentRoom);
    document.getElementById('btn-game-leave')?.addEventListener('click', exitCurrentRoom);

    // Cloud Sync Button in Header
    document.getElementById('nav-btn-sync-cloud')?.addEventListener('click', async () => {
        if (!db) {
            showToast("Firestore is unavailable.", true);
            return;
        }
        try {
            showToast("Syncing question bank to Firestore (specrush)...");
            const staticSet = questionDB.staticQuestions;
            const promises = [];
            for (let i = 0; i < staticSet.length; i++) {
                promises.push(setDoc(doc(db, 'questions', `static_q_${i}`), {
                    ...staticSet[i],
                    updatedAt: serverTimestamp()
                }));
            }
            if (state.currentUser && !state.currentUser.isGuest) {
                promises.push(setDoc(doc(db, 'users', state.currentUser.uid), {
                    displayName: state.userProfile.displayName,
                    avatar: state.userProfile.avatar,
                    elo: state.userProfile.elo,
                    stats: state.userProfile.stats,
                    updatedAt: serverTimestamp()
                }));
            }
            await Promise.all(promises);
            showToast("✅ Cloud sync completed!");
        } catch(e) {
            showToast("Sync note: " + e.message, true);
        }
    });
}

// ---------------------------------------------------------
// ROOM LIFECYCLE & HOST-DELEGATED QUERY PROCESSING
// ---------------------------------------------------------
async function joinRoom(roomId) {
    state.currentRoomId = roomId;
    updateRoomNavLeaveButton();
    await updateRoomInDB(roomId, {
        [`players.${state.currentUser.uid}`]: {
            displayName: state.userProfile.displayName,
            avatar: state.userProfile.avatar,
            elo: state.userProfile.elo,
            score: 0,
            isHost: false
        }
    });
    enterRoom(roomId);
}

function enterRoom(roomId) {
    state.currentRoomId = roomId;
    updateRoomNavLeaveButton();
    if (state.roomUnsubscribe) {
        state.roomUnsubscribe();
        state.roomUnsubscribe = null;
    }

    state.roomUnsubscribe = subscribeToRoom(roomId, (data) => {
        state.roomData = data;
        handleRoomUpdate(data);
    });

    const waitingTitle = document.getElementById('waiting-room-title');
    if (waitingTitle) waitingTitle.innerText = `ROOM #${roomId}`;
    showScreen('room-waiting');
}

async function exitCurrentRoom() {
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

async function handleRoomUpdate(data) {
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
    const players = Object.values(data.players || {}).filter(Boolean);
    const playerCount = document.getElementById('waiting-player-count');
    if (playerCount) playerCount.innerText = players.length;

    const targetScore = document.getElementById('waiting-target-score');
    if (targetScore) targetScore.innerText = `${data.settings?.targetScore || 10} Pts`;

    const playerListEl = document.getElementById('waiting-players-list');
    if (playerListEl) {
        playerListEl.innerHTML = '';
        players.forEach(p => {
            const item = document.createElement('div');
            item.className = "flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800";
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-xl">${p.avatar || '🧮'}</span>
                    <div>
                        <span class="text-xs font-bold text-white">${p.displayName}</span>
                        ${p.isHost ? '<span class="ml-2 text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Host</span>' : ''}
                    </div>
                </div>
                <span class="font-mono text-xs text-indigo-400 font-bold">${p.elo || 1200} ELO</span>
            `;
            playerListEl.appendChild(item);
        });
    }

    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) startBtn.style.display = isHost ? 'flex' : 'none';

    if (data.status === 'in_game' && document.getElementById('screen-game')?.classList.contains('hidden')) {
        game.startMatch({
            questions: data.questions,
            targetScore: data.settings?.targetScore || 10,
            roomId: data.id,
            isSolo: false
        });
    }

    if (data.status === 'in_game' && !document.getElementById('screen-game')?.classList.contains('hidden')) {
        const container = document.getElementById('live-progress-bars-container');
        if (container) {
            container.innerHTML = '';
            const sorted = players.sort((a, b) => (b.score || 0) - (a.score || 0));
            sorted.forEach(p => {
                const pct = Math.min(100, Math.round(((p.score || 0) / (data.settings?.targetScore || 10)) * 100));
                const isMe = p.displayName === state.userProfile.displayName;

                const bar = document.createElement('div');
                bar.className = "space-y-1";
                bar.innerHTML = `
                    <div class="flex justify-between text-xs font-semibold">
                        <span class="${isMe ? 'text-indigo-400 font-bold' : 'text-slate-300'}">${p.avatar || '🧮'} ${p.displayName} ${isMe ? '(You)' : ''}</span>
                        <span class="font-mono ${isMe ? 'text-indigo-400' : 'text-slate-400'}">${p.score || 0} / ${data.settings?.targetScore || 10}</span>
                    </div>
                    <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r ${isMe ? 'from-indigo-500 to-purple-500' : 'from-slate-600 to-slate-500'} transition-all duration-300" style="width: ${pct}%;"></div>
                    </div>
                `;
                container.appendChild(bar);
            });
        }

        const target = data.settings?.targetScore || 10;
        const winner = players.find(p => (p.score || 0) >= target);
        if (winner && document.getElementById('screen-results')?.classList.contains('hidden')) {
            game.concludeMatch();
        }
    }
}

document.getElementById('btn-start-game')?.addEventListener('click', async () => {
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
});

async function loadPublicRooms() {
    const container = document.getElementById('rooms-list-container');
    const countLabel = document.getElementById('rooms-count-label');
    if (!container || !countLabel) return;

    const roomList = await getPublicRoomsFromDB();
    countLabel.innerText = `${roomList.length} room${roomList.length === 1 ? '' : 's'} available`;
    container.innerHTML = '';

    if (roomList.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 italic">No public matches active on specrush. Create one to get started!</div>`;
        return;
    }

    roomList.forEach(room => {
        const playerCount = Object.keys(room.players || {}).filter(k => room.players[k]).length;
        const card = document.createElement('div');
        card.className = "glass-card p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition cursor-pointer";
        card.innerHTML = `
            <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold text-white text-xs">PIN: ${room.id}</span>
                    <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">First to ${room.settings?.targetScore || 10}</span>
                </div>
                <p class="text-[11px] text-slate-400">Topics: ${(room.settings?.topics || []).slice(0, 3).join(', ')}...</p>
            </div>
            <button class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
                Join (${playerCount})
            </button>
        `;
        card.onclick = () => joinRoom(room.id);
        container.appendChild(card);
    });
}
