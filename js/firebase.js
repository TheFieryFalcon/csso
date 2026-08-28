// ---------------------------------------------------------
// FIREBASE CLOUD FIRESTORE & AUTHENTICATION ABSTRACTION
// Configured for project: specrush
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteField, 
    query, where, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const LOCAL_STORAGE_KEY_PROFILE = 'csso_math_user_profile_v1';
export const LOCAL_STORAGE_KEY_ROOMS = 'csso_math_mock_rooms_v1';
export const LOCAL_STORAGE_KEY_FIREBASE_API_KEY = 'csso_firebase_api_key';

export const DEFAULT_FIREBASE_API_KEY = "AIzaSyBhm7I2wEcJkqEOn_XJi9XmUw-94y0Q8nw";

export function getFirebaseApiKey() {
    return localStorage.getItem(LOCAL_STORAGE_KEY_FIREBASE_API_KEY) || DEFAULT_FIREBASE_API_KEY;
}

export function setFirebaseApiKey(key) {
    if (key && key.trim()) {
        localStorage.setItem(LOCAL_STORAGE_KEY_FIREBASE_API_KEY, key.trim());
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_FIREBASE_API_KEY);
    }
}

// Firebase Configuration targeting project: specrush
export const firebaseConfig = {
    apiKey: getFirebaseApiKey(),
    authDomain: "specrush.firebaseapp.com",
    projectId: "specrush",
    storageBucket: "specrush.firebasestorage.app",
    messagingSenderId: "1056581177651",
    appId: "1:1056581177651:web:specrush"
};

export let app = null;
export let db = null;
export let auth = null;
export let provider = null;
export let isFirebaseAvailable = false;

export function initFirebase() {
    const key = getFirebaseApiKey();
    if (key && key !== "") {
        try {
            firebaseConfig.apiKey = key;
            app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            provider = new GoogleAuthProvider();
            isFirebaseAvailable = true;
            console.log("Connected to Firebase project: specrush");
            return true;
        } catch (e) {
            console.warn("Firebase initialization note:", e);
            // If already initialized, recover existing instances
            if (e.code === 'app/duplicate-app' || (e.message && e.message.includes('already exists'))) {
                try {
                    db = getFirestore();
                    auth = getAuth();
                    provider = new GoogleAuthProvider();
                    isFirebaseAvailable = true;
                    return true;
                } catch(err) {}
            }
            isFirebaseAvailable = false;
            return false;
        }
    } else {
        console.warn("No Firebase API Key provided for specrush. Running in high-performance local fallback mode.");
        isFirebaseAvailable = false;
        return false;
    }
}

// Initial auto-initialization attempt
initFirebase();

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

export function createFreshGuestProfile() {
    return {
        uid: 'guest_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Guest Mathlete',
        avatar: '🧮',
        elo: 1200,
        isGuest: true,
        stats: getInitialStats()
    };
}

export function loadLocalProfile() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!parsed.stats) parsed.stats = getInitialStats();
            return parsed;
        } catch(e) {}
    }
    return createFreshGuestProfile();
}

export function saveLocalProfile(profile) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function clearLocalProfile() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
}

export function setDeepValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    if (value === null || value === undefined) {
        delete current[keys[keys.length - 1]];
    } else {
        current[keys[keys.length - 1]] = value;
    }
}

export async function saveRoomToDB(roomId, data) {
    if (isFirebaseAvailable && db) {
        try {
            await setDoc(doc(db, 'rooms', roomId), data);
            return;
        } catch(e) {
            console.warn("Firestore setDoc failed, falling back to local:", e);
        }
    }
    const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
    rooms[roomId] = data;
    localStorage.setItem(LOCAL_STORAGE_KEY_ROOMS, JSON.stringify(rooms));
}

export async function getRoomFromDB(roomId) {
    if (isFirebaseAvailable && db) {
        try {
            const snap = await getDoc(doc(db, 'rooms', roomId));
            if (snap.exists()) return snap.data();
        } catch(e) {}
    }
    const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
    return rooms[roomId] || null;
}

export async function getPublicRoomsFromDB() {
    if (isFirebaseAvailable && db) {
        try {
            const roomsCol = collection(db, 'rooms');
            const q = query(roomsCol, where('status', '==', 'waiting'));
            const snap = await getDocs(q);
            const firestoreRooms = [];
            snap.forEach(d => firestoreRooms.push(d.data()));
            if (firestoreRooms.length > 0) return firestoreRooms;
        } catch (e) {
            console.warn("Firestore getPublicRooms query warning, checking local storage:", e);
        }
    }
    const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
    return Object.values(rooms).filter(r => r && r.status === 'waiting');
}

export async function updateRoomInDB(roomId, patch) {
    if (isFirebaseAvailable && db) {
        try {
            const firestorePatch = {};
            Object.keys(patch).forEach(k => {
                firestorePatch[k] = (patch[k] === null || patch[k] === undefined) ? deleteField() : patch[k];
            });
            await updateDoc(doc(db, 'rooms', roomId), firestorePatch);
            return;
        } catch(e) {
            console.warn("Firestore updateDoc failed, falling back to local:", e);
        }
    }
    const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
    if (rooms[roomId]) {
        Object.keys(patch).forEach(key => {
            setDeepValue(rooms[roomId], key, patch[key]);
        });
        localStorage.setItem(LOCAL_STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    }
}

export function subscribeToRoom(roomId, callback) {
    if (isFirebaseAvailable && db) {
        try {
            return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
                if (snap.exists()) {
                    callback(snap.data());
                }
            });
        } catch(e) {}
    }
    const interval = setInterval(() => {
        const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
        if (rooms[roomId]) callback(rooms[roomId]);
    }, 500);
    return () => clearInterval(interval);
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
    signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, 
    doc, setDoc, getDoc, getDocs, updateDoc, deleteField, collection, query, where, serverTimestamp
};
