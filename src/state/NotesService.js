class Note {
  constructor(id, title, content, updatedAt) {
    this.id = id;
    this.title = title || 'Untitled';
    this.content = content || '';
    this.updatedAt = updatedAt || 0;
  }
  static create(id, clock, title = 'New note', content = '') {
    return new Note(id, title, content, clock.now());
  }
}

export default class NotesService {
  constructor(clock, idGen) {
    this.clock = clock;
    this.idGen = idGen;
    this.state = { notes: [], selectedId: null, theme: 'dark' };
  }

  hydrate(data) {
    const notes = (data?.notes || []).map(
      n => new Note(n.id, n.title, n.content, n.updatedAt)
    );
    this.state = {
      notes,
      selectedId: data?.selectedId || (notes[0] && notes[0].id) || null,
      theme: data?.theme === 'light' ? 'light' : 'dark'
    };
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getSelected() {
    return this.state.notes.find(n => n.id === this.state.selectedId) || null;
  }

  ensureAtLeastOneNote(defaultTitle = 'Welcome', defaultContent = 'This is your first note. Start typing!') {
    if (this.state.notes.length === 0) {
      const id = this.idGen.newId();
      const n = Note.create(id, this.clock, defaultTitle, defaultContent);
      this.state.notes.push(n);
      this.state.selectedId = n.id;
      return true;
    }
    return false;
  }

  addNote() {
    const id = this.idGen.newId();
    const n = Note.create(id, this.clock, 'New note', '');
    this.state.notes.unshift(n);
    this.state.selectedId = n.id;
    return n;
  }

  selectNote(id) {
    if (this.state.notes.some(n => n.id === id)) {
      this.state.selectedId = id;
      return true;
    }
    return false;
  }

  updateContent(id, content) {
    const note = this.state.notes.find(n => n.id === id);
    if (!note) return false;
    note.content = content;
    note.updatedAt = this.clock.now();
    return true;
  }

  updateTitle(id, title) {
    const note = this.state.notes.find(n => n.id === id);
    if (!note) return false;
    note.title = (title || '').trim() || 'Untitled';
    note.updatedAt = this.clock.now();
    return true;
  }

  deleteNote(id) {
    const idx = this.state.notes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    const wasSelected = (this.state.selectedId === id);
    this.state.notes.splice(idx, 1);
    if (this.state.notes.length === 0) {
      this.state.selectedId = null;
    } else if (wasSelected) {
      this.state.selectedId = this.state.notes[0].id;
    }
    return true;
  }

  clearAll() {
    this.state.notes = [];
    this.state.selectedId = null;
  }

  setTheme(theme) {
    this.state.theme = (theme === 'light') ? 'light' : 'dark';
    return this.state.theme;
  }
}
