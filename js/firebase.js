// ---------------------------------------------------------
// FIREBASE CLOUD FIRESTORE & AUTHENTICATION ABSTRACTION
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export const LOCAL_STORAGE_KEY_PROFILE = 'csso_math_user_profile_v1';
export const LOCAL_STORAGE_KEY_ROOMS = 'csso_math_mock_rooms_v1';

// Firebase Configuration (Fallback gracefully to local offline mode if missing)
export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

export let app = null;
export let db = null;
export let auth = null;
export let provider = null;
export let isFirebaseAvailable = false;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();
        isFirebaseAvailable = true;
        console.log("Firebase initialized successfully.");
    } else {
        console.warn("No Firebase API Key provided. Running in high-performance local storage mode.");
    }
} catch (e) {
    console.warn("Firebase initialization skipped:", e);
}

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

export function loadLocalProfile() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (!parsed.stats) parsed.stats = getInitialStats();
            return parsed;
        } catch(e) {}
    }
    return {
        uid: 'guest_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Year 12 Mathlete',
        avatar: '🧮',
        elo: 1200,
        isGuest: true,
        stats: getInitialStats()
    };
}

export function saveLocalProfile(profile) {
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
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
    current[keys[keys.length - 1]] = value;
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

export async function updateRoomInDB(roomId, patch) {
    if (isFirebaseAvailable && db) {
        try {
            await updateDoc(doc(db, 'rooms', roomId), patch);
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
                if (snap.exists()) callback(snap.data());
            });
        } catch(e) {}
    }
    const interval = setInterval(() => {
        const rooms = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS) || '{}');
        if (rooms[roomId]) callback(rooms[roomId]);
    }, 500);
    return () => clearInterval(interval);
}

export {
    signInWithPopup, GoogleAuthProvider, signOut, doc, setDoc, getDoc, updateDoc, serverTimestamp
};
