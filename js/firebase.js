// ---------------------------------------------------------
// FIREBASE CLOUD FIRESTORE & AUTHENTICATION ABSTRACTION
// Configured strictly for Firebase Project: specrush
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteField, 
    query, where, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const LOCAL_STORAGE_KEY_PROFILE = 'csso_math_user_profile_v1';

// Firebase Configuration strictly for project: specrush
export const firebaseConfig = {
    apiKey: "AIzaSyBhm7I2wEcJkqEOn_XJi9XmUw-94y0Q8nw",
    authDomain: "specrush.firebaseapp.com",
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
        db = getFirestore(app);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        isFirebaseAvailable = true;
        console.log("Connected to Firebase: specrush");
        return true;
    } catch (e) {
        if (e.code === 'app/duplicate-app' || (e.message && e.message.includes('already exists'))) {
            try {
                db = getFirestore();
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
// AUTHENTICATION PROVIDERS (ANONYMOUS, EMAIL, GOOGLE)
// ---------------------------------------------------------

/**
 * Setup Auth Observer
 */
export function setupAuthObserver(callback) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
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
// PROFILE & STATS HELPERS
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

export async function syncUserProfileWithFirestore(user, customName = null) {
    if (!db || !user) return;
    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                displayName: customName || user.displayName || 'Mathlete',
                email: user.email || null,
                avatar: '🧮',
                elo: 1200,
                stats: getInitialStats(),
                isAnonymous: user.isAnonymous || false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (e) {
        console.warn("Firestore user sync warning:", e);
    }
}

export async function syncQuestionsToFirestore(questionsArray, userProfile) {
    if (!db) throw new Error("Firestore database is unavailable.");
    const promises = [];
    for (let i = 0; i < questionsArray.length; i++) {
        promises.push(setDoc(doc(db, 'questions', `static_q_${i}`), {
            ...questionsArray[i],
            updatedAt: serverTimestamp()
        }));
    }
    if (userProfile && userProfile.uid) {
        promises.push(setDoc(doc(db, 'users', userProfile.uid), {
            displayName: userProfile.displayName,
            avatar: userProfile.avatar,
            elo: userProfile.elo,
            stats: userProfile.stats,
            updatedAt: serverTimestamp()
        }, { merge: true }));
    }
    await Promise.all(promises);
}

// ---------------------------------------------------------
// CLOUD FIRESTORE MULTIPLAYER ROOMS (BULLETPROOF WITH MERGE)
// ---------------------------------------------------------
export function expandDotNotation(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        const parts = key.split('.');
        let curr = result;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
                curr[parts[i]] = {};
            }
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = val;
    }
    return result;
}

export async function saveRoomToDB(roomId, data) {
    if (!db) throw new Error("Firestore database is unavailable.");
    await setDoc(doc(db, 'rooms', roomId), data);
}

export async function getRoomFromDB(roomId) {
    if (!db) throw new Error("Firestore database is unavailable.");
    const snap = await getDoc(doc(db, 'rooms', roomId));
    if (snap.exists()) return snap.data();
    return null;
}

export async function getPublicRoomsFromDB() {
    if (!db) return [];
    try {
        const roomsCol = collection(db, 'rooms');
        const q = query(roomsCol, where('status', '==', 'waiting'));
        const snap = await getDocs(q);
        const rooms = [];
        snap.forEach(d => rooms.push(d.data()));
        return rooms;
    } catch (e) {
        console.warn("Error fetching rooms from Firestore:", e);
        return [];
    }
}

export async function updateRoomInDB(roomId, patch) {
    if (!db) throw new Error("Firestore database is unavailable.");
    try {
        const firestorePatch = {};
        Object.keys(patch).forEach(k => {
            firestorePatch[k] = (patch[k] === null || patch[k] === undefined) ? deleteField() : patch[k];
        });
        await updateDoc(doc(db, 'rooms', roomId), firestorePatch);
    } catch (e) {
        // Resilient fallback using setDoc merge
        const expanded = expandDotNotation(patch);
        await setDoc(doc(db, 'rooms', roomId), expanded, { merge: true });
    }
}

export function subscribeToRoom(roomId, callback, onError) {
    if (!db) throw new Error("Firestore database is unavailable.");
    return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
        if (snap.exists()) {
            callback(snap.data());
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
        [`pendingQueries.${queryId}`]: {
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
        [`pendingQueries.${queryId}.status`]: 'resolved',
        [`pendingQueries.${queryId}.result`]: result,
        [`pendingQueries.${queryId}.resolvedAt`]: Date.now()
    };
    await updateRoomInDB(roomId, patch);
}

export {
    onAuthStateChanged, doc, setDoc, getDoc, getDocs, updateDoc, deleteField, collection, query, where, serverTimestamp
};
