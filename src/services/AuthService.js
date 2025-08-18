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

    // Ensures there's an authenticated user; falls back to anonymous sign-in
    static async ensureSignedIn() {
        const current = firebase.auth().currentUser;
        if (current) return current;

        try {
            const credential = await firebase.auth().signInAnonymously();
            return credential.user;
        } catch (e) {
            throw new Error(`Failed to sign in: ${e.message}`);
        }
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
        return await user.getIdToken(forceRefresh);
    }
}
