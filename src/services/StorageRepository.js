import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_KEY = 'notesapp.storage.v1';

export default class StorageRepository {
  constructor(storageKey = DEFAULT_KEY) {
    this.key = storageKey;
  }

  async load() {
    try {
      const raw = await AsyncStorage.getItem(this.key);
      if (!raw) {
        return { notes: [], selectedId: null, theme: 'dark', lastWriteBy: 'local' };
      }
      const data = JSON.parse(raw);
      const notes = Array.isArray(data.notes) ? data.notes : [];
      return {
        notes: notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
        selectedId: data.selectedId || (notes[0] && notes[0].id) || null,
        theme: data.theme === 'light' ? 'light' : 'dark',
        lastWriteBy: 'local'
      };
    } catch (e) {
      return { notes: [], selectedId: null, theme: 'dark', lastWriteBy: 'local' };
    }
  }

  async save(payload) {
    const toSave = {
      notes: Array.isArray(payload?.notes) ? payload.notes : [],
      selectedId: payload?.selectedId || null,
      theme: payload?.theme === 'light' ? 'light' : 'dark'
    };
    await AsyncStorage.setItem(this.key, JSON.stringify(toSave));
  }

  async clear() {
    await AsyncStorage.removeItem(this.key);
  }
}