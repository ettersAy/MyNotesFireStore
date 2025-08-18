// Import the functions you need from the SDKs you need
import firebase from 'firebase';
import 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig.js';

// Initialize Firebase (v8 namespaced API)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
export default class FirestoreRepository {
    constructor(clientId) {
        if (!clientId) {
            throw new Error('FirestoreRepository requires a clientId.');
        }
        this.clientId = clientId;
        this.userDocRef = db.collection('users').doc(this.clientId);
        this.notesColRef = this.userDocRef.collection('notes');
    }

    async load() {
        try {
            const settingsDoc = await this.userDocRef.get();
            const notesSnapshot = await this.notesColRef.get();

            const notes = notesSnapshot.docs.map(d => d.data());
            const settings = settingsDoc.exists ? settingsDoc.data() : {};

            return {
                notes: Array.isArray(notes) ? notes.sort((a, b) => b.updatedAt - a.updatedAt) : [],
                selectedId: settings.selectedId || null,
                theme: settings.theme === 'light' ? 'light' : 'dark',
                lastWriteBy: settings.lastWriteBy || null,
            };
        } catch (error) {
            console.error('Error loading data from Firestore:', error);
            return { notes: [], selectedId: null, theme: 'dark', lastWriteBy: null };
        }
    }

    async save(payload) {
        const batch = db.batch();

        // 1. Save settings
        const settingsData = {
            selectedId: payload.selectedId,
            theme: payload.theme,
            lastWriteBy: this.clientId,
        };
        batch.set(this.userDocRef, settingsData, { merge: true });

        // 2. Sync notes
        const newNotesMap = new Map(payload.notes.map(note => [note.id, note]));
        const existingNotesSnapshot = await this.notesColRef.get();

        // Delete notes that are no longer in the payload
        for (const noteDoc of existingNotesSnapshot.docs) {
            if (!newNotesMap.has(noteDoc.id)) {
                batch.delete(this.notesColRef.doc(noteDoc.id));
            }
        }

        // Add or update notes from the payload
        for (const note of payload.notes) {
            const noteObject = { ...note }; // Convert class instance to plain object
            batch.set(this.notesColRef.doc(note.id), noteObject);
        }

        await batch.commit();
    }
}