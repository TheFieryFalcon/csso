// ---------------------------------------------------------
// FIREBASE REALTIME DATABASE & AUTHENTICATION ABSTRACTION
// Configured strictly for Firebase Project: specrush
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, ref, set, get, update, onValue, off, child, serverTimestamp as rtdbServerTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
    getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const LOCAL_STORAGE_KEY_PROFILE = 'csso_math_user_profile_v1';

// Unified Firebase Configuration strictly for project: specrush
export const firebaseConfig = {
    apiKey: "AIzaSyBhm7I2wEcJkqEOn_XJi9XmUw-94y0Q8nw",
    authDomain: "specrush.firebaseapp.com",
    databaseURL: "https://specrush-default-rtdb.firebaseio.com",
    projectId: "specrush",
    storageBucket: "specrush.firebasestorage.app",
    messagingSenderId: "1056581177651",
    appId: "1:1056581177651:web:specrush"
};

export let app = null;
export let db = null;
export let auth = null;
export let googleProvider = null;
export let isFirebaseAvailable = false;

export function initFirebase() {
    try {
        app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        isFirebaseAvailable = true;
        console.log("Connected to specrush Realtime Database.");
        return true;
    } catch (e) {
        if (e.code === 'app/duplicate-app' || (e.message && e.message.includes('already exists'))) {
            try {
                db = getDatabase(app || undefined);
                auth = getAuth();
                googleProvider = new GoogleAuthProvider();
                isFirebaseAvailable = true;
                return true;
            } catch(err) {}
        }
        console.error("Firebase connection error:", e);
        isFirebaseAvailable = false;
        return false;
    }
}

// Initialize on module load
initFirebase();

// ---------------------------------------------------------
// AUTHENTICATION PROVIDERS & SESSION RECOVERY
// ---------------------------------------------------------

export function setupAuthObserver(callback) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
}

/**
 * Ensures an active Firebase user exists before database operations
 */
export async function ensureAuthUser() {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
}

/**
 * 1. Anonymous Authentication
 */
export async function authSignInAnonymous() {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const userCred = await signInAnonymously(auth);
    return userCred.user;
}

/**
 * 2. Email & Password Authentication (Sign In or Sign Up)
 */
export async function authSignInEmail(email, password, isSignUp = false) {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        return userCred.user;
    } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        return userCred.user;
    }
}

/**
 * 3. Google OAuth Authentication
 */
export async function authSignInGoogle() {
    if (!auth || !googleProvider) throw new Error("Firebase Auth is not initialized.");
    const userCred = await signInWithPopup(auth, googleProvider);
    return userCred.user;
}

/**
 * Sign Out
 */
export async function authSignOut() {
    if (auth) {
        await signOut(auth);
    }
    clearLocalProfile();
}

// ---------------------------------------------------------
// USER PROFILES & FIRST-TIME USERNAME TRACKING
// ---------------------------------------------------------
export function getInitialStats() {
    return {
        totalAnswered: 0,
        totalCorrect: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        topicStats: {
            'Functions and Graphs': { answered: 0, correct: 0 },
            'Trigonometric Functions': { answered: 0, correct: 0 },
            'Counting and Probability': { answered: 0, correct: 0 },
            'Exponential Functions': { answered: 0, correct: 0 },
            'Sequences and Series': { answered: 0, correct: 0 },
            'Rates of Change': { answered: 0, correct: 0 },
            'Geometry': { answered: 0, correct: 0 },
            'Combinatorics': { answered: 0, correct: 0 },
            'Vectors in the Plane': { answered: 0, correct: 0 },
            'Trigonometry (Spec)': { answered: 0, correct: 0 },
            'Matrices': { answered: 0, correct: 0 },
            'Real and Complex Numbers': { answered: 0, correct: 0 }
        }
    };
}

export function loadSavedProfile() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!parsed.stats) parsed.stats = getInitialStats();
            return parsed;
        } catch(e) {}
    }
    return null;
}

export function saveLocalProfile(profile) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function clearLocalProfile() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
}

export async function getUserProfileFromDB(uid) {
    if (!db || !uid) return null;
    try {
        const snap = await get(ref(db, `users/${uid}`));
        if (snap.exists()) return snap.val();
    } catch(e) {
        console.warn("getUserProfileFromDB warning:", e);
    }
    return null;
}

export async function checkUserHasCustomUsername(uid) {
    if (!db || !uid) return false;
    try {
        const snap = await get(ref(db, `users/${uid}`));
        if (snap.exists()) {
            const data = snap.val();
            return Boolean(data.isUsernameSet && data.displayName);
        }
    } catch(e) {
        console.warn("checkUserHasCustomUsername error:", e);
    }
    return false;
}

export async function updateUserUsername(uid, username, avatar = '🧮') {
    if (!db || !uid) return;
    await update(ref(db, `users/${uid}`), {
        displayName: username,
        avatar: avatar,
        isUsernameSet: true,
        updatedAt: Date.now()
    });
}

export async function syncUserProfileWithFirestore(user, customName = null) {
    if (!db || !user) return;
    try {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);
        if (!snap.exists()) {
            await set(userRef, {
                uid: user.uid,
                displayName: customName || `Mathlete_${user.uid.slice(-4).toUpperCase()}`,
                email: user.email || null,
                avatar: '🧮',
                elo: 1200,
                stats: getInitialStats(),
                isAnonymous: user.isAnonymous || false,
                isUsernameSet: Boolean(customName),
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
    } catch (e) {
        console.warn("RTDB user sync warning:", e);
    }
}

export async function syncQuestionsToFirestore(questionsArray, userProfile) {
    if (!db) throw new Error("Realtime database is unavailable.");
    const updates = {};
    for (let i = 0; i < questionsArray.length; i++) {
        updates[`questions/static_q_${i}`] = {
            ...questionsArray[i],
            updatedAt: Date.now()
        };
    }
    if (userProfile && userProfile.uid) {
        updates[`users/${userProfile.uid}/displayName`] = userProfile.displayName;
        updates[`users/${userProfile.uid}/avatar`] = userProfile.avatar;
        updates[`users/${userProfile.uid}/elo`] = userProfile.elo;
        updates[`users/${userProfile.uid}/stats`] = userProfile.stats;
        updates[`users/${userProfile.uid}/updatedAt`] = Date.now();
    }
    await update(ref(db), updates);
}

// ---------------------------------------------------------
// UNIFIED SPEC-RUSH MULTIPLAYER ROOMS VIA REALTIME DATABASE
// ---------------------------------------------------------
function formatPatchToRTDB(patch) {
    const formatted = {};
    for (const key of Object.keys(patch)) {
        const slashKey = key.replace(/\./g, '/');
        formatted[slashKey] = patch[key];
    }
    return formatted;
}

export async function saveRoomToDB(roomId, data) {
    if (!db) throw new Error("Realtime database is unavailable.");
    const cleanId = String(roomId).trim();
    await set(ref(db, `rooms/${cleanId}`), data);
}

export async function getRoomFromDB(roomId) {
    if (!db) throw new Error("Realtime database is unavailable.");
    const cleanId = String(roomId).trim();
    const snap = await get(ref(db, `rooms/${cleanId}`));
    if (snap.exists()) return snap.val();
    return null;
}

export async function getPublicRoomsFromDB() {
    if (!db) return [];
    try {
        const snap = await get(ref(db, 'rooms'));
        if (snap.exists()) {
            const val = snap.val();
            const rooms = [];
            for (const key of Object.keys(val || {})) {
                if (val[key] && val[key].status === 'waiting') {
                    rooms.push(val[key]);
                }
            }
            return rooms;
        }
        return [];
    } catch (e) {
        console.warn("Error querying public rooms from specrush:", e);
        return [];
    }
}

export async function updateRoomInDB(roomId, patch) {
    if (!db) throw new Error("Realtime database is unavailable.");
    const cleanId = String(roomId).trim();
    const formatted = formatPatchToRTDB(patch);
    await update(ref(db, `rooms/${cleanId}`), formatted);
}

export function subscribeToRoom(roomId, callback, onError) {
    if (!db) throw new Error("Realtime database is unavailable.");
    const cleanId = String(roomId).trim();
    const roomRef = ref(db, `rooms/${cleanId}`);
    return onValue(roomRef, (snap) => {
        if (snap.exists()) {
            callback(snap.val());
        } else {
            callback(null);
        }
    }, (err) => {
        console.error("Room subscription error:", err);
        if (onError) onError(err);
    });
}

// ---------------------------------------------------------
// HOST-DELEGATED PROOF QUERY DISPATCH HELPERS
// ---------------------------------------------------------
export async function submitProofQueryToRoom(roomId, queryData) {
    const queryId = 'query_' + Math.random().toString(36).substr(2, 9);
    const patch = {
        [`pendingQueries/${queryId}`]: {
            ...queryData,
            id: queryId,
            status: 'pending',
            createdAt: Date.now()
        }
    };
    await updateRoomInDB(roomId, patch);
    return queryId;
}

export async function resolveProofQueryInRoom(roomId, queryId, result) {
    const patch = {
        [`pendingQueries/${queryId}/status`]: 'resolved',
        [`pendingQueries/${queryId}/result`]: result,
        [`pendingQueries/${queryId}/resolvedAt`]: Date.now()
    };
    await updateRoomInDB(roomId, patch);
}

// ---------------------------------------------------------
// COMPATIBILITY ADAPTERS FOR FIRESTORE STYLE CALLS
// ---------------------------------------------------------
export function doc(database, collectionPath, docId) {
    return {
        path: `${collectionPath}/${docId}`,
        collection: collectionPath,
        id: docId
    };
}

export async function getDoc(docRef) {
    if (!db) return { exists: () => false, data: () => null };
    const path = typeof docRef === 'string' ? docRef : docRef.path;
    const snap = await get(ref(db, path));
    return {
        exists: () => snap.exists(),
        data: () => snap.val(),
        val: () => snap.val()
    };
}

export async function setDoc(docRef, data, options = {}) {
    if (!db) return;
    const path = typeof docRef === 'string' ? docRef : docRef.path;
    if (options && options.merge) {
        const formattedPatch = formatPatchToRTDB(data);
        await update(ref(db, path), formattedPatch);
    } else {
        await set(ref(db, path), data);
    }
}

export async function updateDoc(docRef, data) {
    if (!db) return;
    const path = typeof docRef === 'string' ? docRef : docRef.path;
    const formattedPatch = formatPatchToRTDB(data);
    await update(ref(db, path), formattedPatch);
}

export function serverTimestamp() {
    return Date.now();
}

export {
    onAuthStateChanged, ref, getDatabase
};
