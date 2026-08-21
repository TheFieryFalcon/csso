// ---------------------------------------------------------
// WACE MATH RUSH - MAIN APPLICATION ENTRY POINT
// ---------------------------------------------------------
import { 
    loadLocalProfile, saveLocalProfile, isFirebaseAvailable, auth, db, provider, 
    signInWithPopup, signOut, doc, setDoc, getDoc, updateDoc, serverTimestamp,
    saveRoomToDB, getRoomFromDB, updateRoomInDB, subscribeToRoom, LOCAL_STORAGE_KEY_ROOMS
} from './firebase.js';
import { questionDB } from './questions/questionDB.js';
import { GameEngine } from './game.js';
import { 
    showToast, showScreen, renderProfileDashboard, updateNavbarProfileBadge, 
    AVAILABLE_AVATARS, initScratchpad 
} from './ui.js';
import { setGeminiApiKey, getGeminiApiKey } from './gemini.js';

// Application State Object
const state = {
    currentUser: null,
    userProfile: loadLocalProfile(),
    currentRoomId: null,
    roomUnsubscribe: null,
    roomData: null
};

// Initialize Game Engine
const game = new GameEngine(state);

// ---------------------------------------------------------
// DOM EVENT LISTENERS & ROUTING
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarProfileBadge(state.userProfile);
    initScratchpad();
    setupAvatarPicker();
    setupLobbyControls();
    showScreen('landing');
});

// Top Navigation
document.getElementById('nav-brand-logo')?.addEventListener('click', () => showScreen('landing'));
document.getElementById('nav-btn-landing')?.addEventListener('click', () => showScreen('landing'));
document.getElementById('nav-btn-lobby')?.addEventListener('click', () => {
    if (!state.currentUser) {
        showScreen('login');
    } else {
        showScreen('lobby');
        loadPublicRooms();
    }
});
document.getElementById('nav-btn-profile')?.addEventListener('click', () => {
    if (!state.currentUser) {
        showScreen('login');
    } else {
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    }
});

// Landing Page Hero CTA
document.getElementById('landing-btn-start-playing')?.addEventListener('click', () => {
    if (!state.currentUser) {
        showScreen('login');
    } else {
        showScreen('lobby');
        loadPublicRooms();
    }
});
document.getElementById('landing-btn-view-profile')?.addEventListener('click', () => {
    if (!state.currentUser) {
        showScreen('login');
    } else {
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    }
});

// ---------------------------------------------------------
// AUTHENTICATION HANDLERS
// ---------------------------------------------------------
document.getElementById('btn-google-login')?.addEventListener('click', async () => {
    if (!isFirebaseAvailable || !auth || !provider) {
        showToast("Firebase Auth not configured. Continuing in local guest mode.", true);
        state.userProfile.isGuest = true;
        state.userProfile.displayName = "Google User (Offline)";
        saveLocalProfile(state.userProfile);
        state.currentUser = { uid: state.userProfile.uid, displayName: state.userProfile.displayName, isGuest: true };
        updateNavbarProfileBadge(state.userProfile);
        showScreen('lobby');
        loadPublicRooms();
        return;
    }
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        state.currentUser = {
            uid: user.uid,
            displayName: user.displayName || 'Mathlete',
            email: user.email,
            isGuest: false
        };
        state.userProfile.uid = user.uid;
        state.userProfile.displayName = user.displayName || state.userProfile.displayName;
        state.userProfile.isGuest = false;

        if (db) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                state.userProfile.elo = data.elo || state.userProfile.elo;
                state.userProfile.avatar = data.avatar || state.userProfile.avatar;
                state.userProfile.stats = data.stats || state.userProfile.stats;
            } else {
                await setDoc(doc(db, 'users', user.uid), {
                    displayName: state.userProfile.displayName,
                    avatar: state.userProfile.avatar,
                    elo: state.userProfile.elo,
                    stats: state.userProfile.stats,
                    updatedAt: serverTimestamp()
                });
            }
        }

        saveLocalProfile(state.userProfile);
        updateNavbarProfileBadge(state.userProfile);
        showToast(`Welcome back, ${state.userProfile.displayName}!`);
        showScreen('lobby');
        loadPublicRooms();
    } catch (err) {
        console.error("Google Auth error:", err);
        if (err.code === 'auth/unauthorized-domain') {
            showToast("This domain is not authorized in Firebase Console. Continuing as guest.", true);
        } else if (err.code === 'auth/popup-blocked') {
            showToast("Sign-in popup was blocked. Please allow popups.", true);
        } else {
            showToast("Sign in unavailable: " + (err.message || 'Please use guest login.'), true);
        }
    }
});

document.getElementById('form-guest-login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('input-guest-name')?.value.trim();
    if (!nameInput) return;

    state.userProfile.displayName = nameInput;
    state.userProfile.isGuest = true;
    state.currentUser = {
        uid: state.userProfile.uid,
        displayName: state.userProfile.displayName,
        isGuest: true
    };
    saveLocalProfile(state.userProfile);
    updateNavbarProfileBadge(state.userProfile);
    showToast(`Playing as ${state.userProfile.displayName}`);
    showScreen('lobby');
    loadPublicRooms();
});

document.getElementById('profile-btn-logout')?.addEventListener('click', async () => {
    if (isFirebaseAvailable && auth && !state.currentUser?.isGuest) {
        await signOut(auth);
    }
    state.currentUser = null;
    state.userProfile = loadLocalProfile();
    updateNavbarProfileBadge(state.userProfile);
    showToast("Signed out.");
    showScreen('landing');
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
        showToast("✅ Gemini 3.7 Flash AI Proof Evaluator Activated!");
    } else {
        showToast("Gemini API Key removed. Using standard rule matcher.");
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
            document.getElementById('profile-avatar-display').innerText = emoji;
            updateNavbarProfileBadge(state.userProfile);
            document.getElementById('avatar-picker-container')?.classList.add('hidden');
            showToast(`Avatar updated to ${emoji}`);
            
            if (isFirebaseAvailable && db && state.currentUser && !state.currentUser.isGuest) {
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
        const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
        if (checkedTopics.length === 0) {
            showToast("Please select at least one topic for your lobby!", true);
            return;
        }

        const roomId = Math.floor(100000 + Math.random() * 900000).toString();
        const initialRoom = {
            id: roomId,
            hostUid: state.currentUser.uid,
            status: 'waiting',
            settings: {
                targetScore: selectedTargetScore,
                topics: checkedTopics
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
            createdAt: Date.now()
        };

        await saveRoomToDB(roomId, initialRoom);
        enterRoom(roomId);
    });

    // Join by PIN
    document.getElementById('btn-join-room-code')?.addEventListener('click', async () => {
        const code = document.getElementById('input-room-code')?.value.trim().toUpperCase();
        if (!code || code.length !== 6) {
            showToast("Enter a valid 6-digit room PIN", true);
            return;
        }
        const room = await getRoomFromDB(code);
        if (!room) {
            showToast("Room not found!", true);
            return;
        }
        if (room.status !== 'waiting') {
            showToast("This match is already in progress.", true);
            return;
        }
        await joinRoom(code);
    });

    // Solo Practice Run
    document.getElementById('btn-start-solo-practice')?.addEventListener('click', () => {
        const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
        const activeTopics = checkedTopics.length > 0 ? checkedTopics : null;

        state.currentRoomId = null;
        const questions = questionDB.generateMatchSet(activeTopics, 40);

        document.getElementById('live-progress-bars-container').innerHTML = `
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

        game.startMatch({
            questions: questions,
            targetScore: selectedTargetScore,
            roomId: 'SOLO',
            isSolo: true
        });
    });

    // Short Answer Submissions
    document.getElementById('btn-submit-short-ans')?.addEventListener('click', () => game.submitShortAnswer());
    document.getElementById('short-answer-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') game.submitShortAnswer();
    });

    // Rematch & Results
    document.getElementById('results-btn-rematch')?.addEventListener('click', () => {
        showScreen('lobby');
        loadPublicRooms();
    });
    document.getElementById('results-btn-profile')?.addEventListener('click', () => {
        renderProfileDashboard(state.userProfile, state.currentUser);
        showScreen('profile');
    });

    // Cloud Sync Button in Header
    document.getElementById('nav-btn-sync-cloud')?.addEventListener('click', async () => {
        if (!isFirebaseAvailable || !db) {
            showToast("Firebase not connected. Operating in local storage mode.");
            return;
        }
        try {
            showToast("Syncing question bank & stats to Firestore...");
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
            showToast("✅ Cloud sync completed successfully!");
        } catch(e) {
            showToast("Sync failed: " + e.message, true);
        }
    });
}

// ---------------------------------------------------------
// ROOM LIFECYCLE
// ---------------------------------------------------------
async function joinRoom(roomId) {
    state.currentRoomId = roomId;
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
    if (state.roomUnsubscribe) state.roomUnsubscribe();

    state.roomUnsubscribe = subscribeToRoom(roomId, (data) => {
        state.roomData = data;
        handleRoomUpdate(data);
    });

    document.getElementById('waiting-room-title').innerText = `ROOM #${roomId}`;
    showScreen('waiting');
}

function handleRoomUpdate(data) {
    if (!data) return;

    const players = Object.values(data.players || {});
    document.getElementById('waiting-player-count').innerText = players.length;
    document.getElementById('waiting-target-score').innerText = `${data.settings?.targetScore || 10} Pts`;

    const playerListEl = document.getElementById('waiting-players-list');
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

    const isHost = data.hostUid === state.currentUser?.uid;
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
        container.innerHTML = '';
        const sorted = Object.values(data.players || {}).sort((a, b) => b.score - a.score);
        sorted.forEach(p => {
            const pct = Math.min(100, Math.round((p.score / (data.settings?.targetScore || 10)) * 100));
            const isMe = p.displayName === state.userProfile.displayName;

            const bar = document.createElement('div');
            bar.className = "space-y-1";
            bar.innerHTML = `
                <div class="flex justify-between text-xs font-semibold">
                    <span class="${isMe ? 'text-indigo-400 font-bold' : 'text-slate-300'}">${p.avatar || '🧮'} ${p.displayName} ${isMe ? '(You)' : ''}</span>
                    <span class="font-mono ${isMe ? 'text-indigo-400' : 'text-slate-400'}">${p.score} / ${data.settings?.targetScore || 10}</span>
                </div>
                <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r ${isMe ? 'from-indigo-500 to-purple-500' : 'from-slate-600 to-slate-500'} transition-all duration-300" style="width: ${pct}%;"></div>
                </div>
            `;
            container.appendChild(bar);
        });

        const target = data.settings?.targetScore || 10;
        const winner = players.find(p => p.score >= target);
        if (winner && document.getElementById('screen-results')?.classList.contains('hidden')) {
            game.concludeMatch();
        }
    }
}

document.getElementById('btn-start-game')?.addEventListener('click', async () => {
    if (!state.currentRoomId || !state.roomData) return;
    const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
    const activeTopics = (checkedTopics && checkedTopics.length > 0) ? checkedTopics : state.roomData.settings?.topics;

    const generated = questionDB.generateMatchSet(activeTopics, 50);
    await updateRoomInDB(state.currentRoomId, {
        status: 'in_game',
        questions: generated,
        'settings.topics': activeTopics
    });
});

document.getElementById('btn-leave-room')?.addEventListener('click', async () => {
    if (state.currentRoomId && state.currentUser) {
        const patch = {};
        patch[`players.${state.currentUser.uid}`] = null;
        await updateRoomInDB(state.currentRoomId, patch);
    }
    if (state.roomUnsubscribe) state.roomUnsubscribe();
    state.currentRoomId = null;
    showScreen('lobby');
    loadPublicRooms();
});

async function loadPublicRooms() {
    const container = document.getElementById('rooms-list-container');
    const countLabel = document.getElementById('rooms-count-label');
    if (!container || !countLabel) return;

    const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
    const roomList = Object.values(rooms).filter(r => r.status === 'waiting');

    countLabel.innerText = `${roomList.length} room${roomList.length === 1 ? '' : 's'} available`;
    container.innerHTML = '';

    if (roomList.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-slate-500 italic">No public matches active. Create one to get started!</div>`;
        return;
    }

    roomList.forEach(room => {
        const playerCount = Object.keys(room.players || {}).length;
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
