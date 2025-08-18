// Centralized Firebase Auth service (v8 namespaced API)
import firebase from 'firebase';
import 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig.js';

// Initialize Firebase app if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default class AuthService {
    static get auth() {
        return firebase.auth();
    }

    static getCurrentUser() {
        return firebase.auth().currentUser;
    }

    // Ensures there's an authenticated user; tries anonymous sign-in but falls back gracefully
    static async ensureSignedIn({ timeoutMs = 3000 } = {}) {
        const current = firebase.auth().currentUser;
        if (current) return current;

        const attemptAnon = async () => {
            try {
                const credential = await firebase.auth().signInAnonymously();
                return credential.user;
            } catch (e) {
                return null;
            }
        };

        const timeout = new Promise(resolve => setTimeout(() => resolve(null), timeoutMs));

        // Avoid blocking startup indefinitely if auth is unavailable
        const user = await Promise.race([attemptAnon(), timeout]);
        return user || null;
    }

    static async signInWithEmail(email, password) {
        const credential = await firebase.auth().signInWithEmailAndPassword(email, password);
        return credential.user;
    }

    static async signUpWithEmail(email, password) {
        const credential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        return credential.user;
    }

    static async signOut() {
        await firebase.auth().signOut();
    }

    static onAuthStateChanged(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    }

    static async getIdToken(forceRefresh = false) {
        const user = firebase.auth().currentUser;
        if (!user) return null;
        return user.getIdToken(forceRefresh);
    }
}
