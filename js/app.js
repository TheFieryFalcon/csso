// ---------------------------------------------------------
// WACE MATH RUSH - MAIN APPLICATION ENTRY POINT
// ---------------------------------------------------------
import { db, doc, updateDoc, syncQuestionsToFirestore } from './firebase.js';
import { questionDB } from './questions/questionDB.js';
import { GameEngine } from './game.js';
import { 
    showToast, showScreen, renderProfileDashboard, updateNavbarProfileBadge, 
    AVAILABLE_AVATARS, initScratchpad 
} from './ui.js';
import { setGeminiApiKey } from './gemini.js';
import { state } from './state.js';
import { 
    setupAuthHandlers, updateCloudStatusBadge, completeAuthentication 
} from './auth-controller.js';
import { 
    setupLobbyEventListeners, loadPublicRooms, setGameEngineInstance, 
    updateRoomNavLeaveButton, exitCurrentRoom, getSelectedFormats, joinRoom 
} from './room-manager.js';

// Initialize Game Engine and bind to room manager
const game = new GameEngine(state);
setGameEngineInstance(game);

// ---------------------------------------------------------
// APPLICATION INITIALIZATION & ROUTING
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initScratchpad();
    setupAvatarPicker();
    setupNavigationHandlers();
    setupLobbyEventListeners();
    setupAuthHandlers(() => loadPublicRooms());
    setupGameplayInputHandlers();

    // Check URL parameters for direct room invite links (e.g. #room=123456)
    const hash = window.location.hash;
    const roomMatch = hash.match(/room=([0-9]{6})/);

    if (state.currentUser && state.currentUser.uid) {
        updateNavbarProfileBadge(state.userProfile);
        updateCloudStatusBadge();
        if (roomMatch && roomMatch[1]) {
            joinRoom(roomMatch[1]);
        } else {
            showScreen('landing');
        }
    } else {
        if (roomMatch && roomMatch[1]) {
            // Auto-sign in anonymously and join room directly from invite
            completeAuthentication({
                uid: 'anon_' + Math.random().toString(36).substr(2, 9),
                displayName: 'Mathlete_' + Math.floor(1000 + Math.random() * 9000),
                email: null
            }, false).then(() => {
                joinRoom(roomMatch[1]);
            });
        } else {
            showScreen('login');
        }
    }
});

// ---------------------------------------------------------
// TOP NAVIGATION & BUTTON ROUTING
// ---------------------------------------------------------
function setupNavigationHandlers() {
    document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
        if (state.currentUser?.uid) showScreen('landing');
        else showScreen('login');
    });
    document.getElementById('nav-btn-landing')?.addEventListener('click', () => {
        if (state.currentUser?.uid) showScreen('landing');
        else showScreen('login');
    });
    document.getElementById('nav-btn-lobby')?.addEventListener('click', () => {
        if (state.currentUser?.uid) {
            showScreen('lobby');
            loadPublicRooms();
        } else {
            showScreen('login');
        }
    });
    document.getElementById('nav-btn-profile')?.addEventListener('click', () => {
        if (state.currentUser?.uid) {
            renderProfileDashboard(state.userProfile, state.currentUser);
            showScreen('profile');
        } else {
            showScreen('login');
        }
    });
    document.getElementById('nav-btn-leave-room')?.addEventListener('click', exitCurrentRoom);

    // Landing Page Hero Buttons
    document.getElementById('landing-btn-start-playing')?.addEventListener('click', () => {
        if (state.currentUser?.uid) {
            showScreen('lobby');
            loadPublicRooms();
        } else {
            showScreen('login');
        }
    });
    document.getElementById('landing-btn-view-profile')?.addEventListener('click', () => {
        if (state.currentUser?.uid) {
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
            showToast("Gemini key saved.");
        } else {
            showToast("Gemini key removed.");
        }
    });

    // Question Bank Cloud Sync Button
    document.getElementById('nav-btn-sync-cloud')?.addEventListener('click', async () => {
        if (!db) {
            showToast("Firestore is unavailable.", true);
            return;
        }
        try {
            showToast("Syncing question bank to Firestore...");
            await syncQuestionsToFirestore(questionDB.staticQuestions, state.userProfile);
            showToast("Cloud sync complete.");
        } catch(e) {
            console.error("Cloud sync error:", e);
            showToast("Sync error: " + (e.message || "Failed to sync"), true);
        }
    });
}

// ---------------------------------------------------------
// GAMEPLAY & SUBMISSION HANDLERS
// ---------------------------------------------------------
function setupGameplayInputHandlers() {
    // Solo Practice
    document.getElementById('btn-start-solo-practice')?.addEventListener('click', () => {
        const checkedTopics = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
        const activeTopics = checkedTopics.length > 0 ? checkedTopics : null;
        const formats = getSelectedFormats();

        if (!formats.mcq && !formats.short_answer && !formats.multi_step && !formats.proofs) {
            showToast("Please select at least one problem format.", true);
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
                        <span class="font-medium text-slate-200">${state.userProfile.avatar} ${state.userProfile.displayName} (Solo)</span>
                        <span class="font-mono text-indigo-400 font-medium" id="solo-live-score">0 / 10</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div id="solo-live-bar" class="h-full bg-indigo-500 transition-all duration-300" style="width: 0%;"></div>
                    </div>
                </div>
            `;
        }

        game.startMatch({
            questions: questions,
            targetScore: 10,
            roomId: 'SOLO',
            isSolo: true
        });
    });

    // Short Answer Submissions
    document.getElementById('btn-submit-short-ans')?.addEventListener('click', () => game.submitShortAnswer());
    document.getElementById('short-answer-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') game.submitShortAnswer();
    });

    // Long Proof Submission
    document.getElementById('btn-submit-long-proof')?.addEventListener('click', () => game.submitLongAnswerProof());

    // Rematch & Results Routing
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
}

// ---------------------------------------------------------
// AVATAR PICKER
// ---------------------------------------------------------
function setupAvatarPicker() {
    const avatarGrid = document.getElementById('avatar-options-grid');
    if (!avatarGrid) return;
    avatarGrid.innerHTML = '';
    AVAILABLE_AVATARS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.className = "w-9 h-9 rounded-lg glass-button text-lg flex items-center justify-center hover:scale-105 transition";
        btn.innerText = emoji;
        btn.onclick = async () => {
            state.userProfile.avatar = emoji;
            const avatarDisplay = document.getElementById('profile-avatar-display');
            if (avatarDisplay) avatarDisplay.innerText = emoji;
            updateNavbarProfileBadge(state.userProfile);
            document.getElementById('avatar-picker-container')?.classList.add('hidden');
            showToast(`Avatar set to ${emoji}`);
            
            if (db && state.currentUser?.uid) {
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
