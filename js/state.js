// ---------------------------------------------------------
// STATE MANAGEMENT MODULE
// ---------------------------------------------------------
import { loadSavedProfile, getInitialStats } from './firebase.js';

const savedProfile = loadSavedProfile();

export const state = {
    userProfile: savedProfile || {
        uid: null,
        displayName: 'Mathlete',
        avatar: '🧮',
        elo: 1200,
        stats: getInitialStats()
    },
    currentUser: savedProfile && savedProfile.uid ? {
        uid: savedProfile.uid,
        displayName: savedProfile.displayName
    } : null,
    currentRoomId: null,
    roomUnsubscribe: null,
    roomData: null,
    processingQueryIds: new Set()
};

export function resetUserState() {
    state.currentUser = null;
    state.userProfile = {
        uid: null,
        displayName: 'Sign In',
        avatar: '🧮',
        elo: 1200,
        stats: getInitialStats()
    };
}
