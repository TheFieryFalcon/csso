// ---------------------------------------------------------
// AUTHENTICATION & USER PROFILE CONTROLLER
// ---------------------------------------------------------
import { 
    auth, db, isFirebaseAvailable,
    setupAuthObserver, authSignInAnonymous, authSignInEmail, authSignInGoogle, authSignOut,
    checkUserHasCustomUsername, updateUserUsername,
    syncUserProfileWithFirestore,
    saveLocalProfile, getInitialStats,
    doc, getDoc
} from './firebase.js';
import { state, resetUserState } from './state.js';
import { showToast, showScreen, updateNavbarProfileBadge } from './ui.js';

export function updateCloudStatusBadge() {
    const badge = document.getElementById('nav-cloud-status');
    const label = document.getElementById('nav-cloud-label');
    if (!badge || !label) return;

    if (isFirebaseAvailable) {
        badge.className = "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        label.innerText = "specrush Cloud";
    } else {
        badge.className = "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20";
        label.innerText = "Offline Mode";
    }
}

export function promptForCustomUsername(defaultName = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-username-setup');
        const input = document.getElementById('input-setup-username');
        const form = document.getElementById('form-setup-username');

        if (!modal || !input || !form) {
            resolve(defaultName || `Mathlete_${Math.floor(1000 + Math.random() * 9000)}`);
            return;
        }

        if (defaultName) input.value = defaultName;
        modal.classList.remove('hidden');
        input.focus();

        const onSubmit = (e) => {
            if (e) e.preventDefault();
            const chosen = input.value.trim();
            if (chosen.length > 0) {
                form.removeEventListener('submit', onSubmit);
                modal.classList.add('hidden');
                resolve(chosen);
            }
        };

        form.addEventListener('submit', onSubmit);
    });
}

export async function completeAuthentication(userObj, autoNavigate = true) {
    state.currentUser = userObj;
    let chosenDisplayName = userObj.displayName;

    // Check if user is logging in with Google for the first time without custom username
    if (db && userObj.uid && userObj.isGoogleAuth) {
        try {
            const hasCustom = await checkUserHasCustomUsername(userObj.uid);
            if (!hasCustom) {
                const suggestedName = userObj.displayName ? userObj.displayName.split(' ')[0] : 'Mathlete';
                chosenDisplayName = await promptForCustomUsername(suggestedName);
                await updateUserUsername(userObj.uid, chosenDisplayName, state.userProfile.avatar || '🧮');
            }
        } catch (err) {
            console.warn("Username check note:", err);
        }
    }

    state.userProfile = {
        uid: userObj.uid,
        displayName: chosenDisplayName || userObj.displayName || 'Mathlete',
        avatar: state.userProfile.avatar || '🧮',
        elo: state.userProfile.elo || 1200,
        stats: state.userProfile.stats || getInitialStats()
    };

    // Sync and load statistics from Firestore
    if (db && userObj.uid) {
        try {
            await syncUserProfileWithFirestore(userObj, chosenDisplayName);
            const userDoc = await getDoc(doc(db, 'users', userObj.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.displayName) state.userProfile.displayName = data.displayName;
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

    if (autoNavigate) {
        showScreen('lobby');
    }
}

export function setupAuthHandlers(onSuccessfulAuth) {
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
            await completeAuthentication({
                uid: user.uid,
                displayName: `Mathlete_${user.uid.slice(-4).toUpperCase()}`,
                email: null
            }, true);
            showToast("Connected to specrush.");
            if (onSuccessfulAuth) onSuccessfulAuth();
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
            await completeAuthentication({
                uid: user.uid,
                displayName: user.displayName || 'Google Mathlete',
                email: user.email,
                isGoogleAuth: true
            }, true);
            showToast(`Welcome, ${state.userProfile.displayName || 'Mathlete'}`);
            if (onSuccessfulAuth) onSuccessfulAuth();
        } catch (err) {
            console.error("Google Auth error:", err);
            if (err.code === 'auth/unauthorized-domain') {
                showToast("Domain not yet authorized in Firebase Console. Please use Anonymous or Email sign-in.", true);
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
            await completeAuthentication({
                uid: user.uid,
                displayName: email.split('@')[0],
                email: email
            }, true);
            showToast(isEmailRegisterMode ? "Account created." : "Signed in.");
            if (onSuccessfulAuth) onSuccessfulAuth();
        } catch (err) {
            console.error("Email auth error:", err);
            showToast("Email Auth: " + (err.message || "Authentication failed"), true);
        }
    });

    // Sign Out Handler
    document.getElementById('profile-btn-logout')?.addEventListener('click', async () => {
        await authSignOut();
        resetUserState();
        updateNavbarProfileBadge(state.userProfile);
        showToast("Signed out.");
        showScreen('login');
    });

    // Setup Firebase Auth observer
    setupAuthObserver(async (firebaseUser) => {
        if (firebaseUser) {
            state.currentUser = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || state.userProfile.displayName || `Mathlete_${firebaseUser.uid.slice(-4).toUpperCase()}`
            };
            state.userProfile.uid = firebaseUser.uid;
            state.userProfile.displayName = state.currentUser.displayName;
            
            if (db) {
                try {
                    await syncUserProfileWithFirestore(firebaseUser, state.currentUser.displayName);
                    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (snap.exists()) {
                        const data = snap.data();
                        state.userProfile.elo = data.elo || state.userProfile.elo || 1200;
                        state.userProfile.avatar = data.avatar || state.userProfile.avatar || '🧮';
                        state.userProfile.stats = data.stats || state.userProfile.stats || getInitialStats();
                    }
                } catch (e) {
                    console.warn("Auth observer Firestore sync note:", e);
                }
            }

            saveLocalProfile(state.userProfile);
            updateNavbarProfileBadge(state.userProfile);
            updateCloudStatusBadge();
        }
    });
}
