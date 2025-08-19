import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getTheme } from './src/theme';
import Editor from './src/components/Editor';
import OptionsMenu from './src/components/OptionsMenu';
import StatusText from './src/components/StatusText';
import LoginModal from './src/components/LoginModal';

import Clock from './src/services/Clock';
import IdGenerator from './src/services/IdGenerator';
import ClipboardService from './src/services/ClipboardService';
import FirestoreRepository from './src/services/FirestoreRepository';
import NotesService from './src/state/NotesService';
import { getOrSetClientId } from './src/utils/clientId';

export default function App() {
  // Services (Dependency Inversion: UI depends on abstractions)
  const clockRef = useRef(new Clock());
  const idRef = useRef(new IdGenerator());
  const clipRef = useRef(new ClipboardService());
  const storeRef = useRef(null); // Initialized asynchronously
  const notesRef = useRef(null); // Initialized asynchronously

  // App state
  const [isReady, setIsReady] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [state, setState] = useState({ notes: [], selectedId: null, theme: 'dark' });
  const [status, setStatus] = useState({ type: null, msg: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  // Theme
  const theme = useMemo(() => getTheme(state.theme), [state.theme]);

  // Manual save mode: no debouncers

  const persist = useCallback(async () => {
    if (!storeRef.current || !notesRef.current || !clientId) return;
    const payload = {
      notes: notesRef.current.state.notes,
      selectedId: notesRef.current.state.selectedId,
      theme: notesRef.current.state.theme,
      lastWriteBy: clientId,
    };
    await storeRef.current.save(payload);
  }, [clientId]);

  const refresh = useCallback(() => {
    if (!notesRef.current) return;
    setState(notesRef.current.getState());
  }, []);

  // Init
  useEffect(() => {
    (async () => {
      try {
        const id = await getOrSetClientId();
        setClientId(id);

        // Init services
        notesRef.current = new NotesService(clockRef.current, idRef.current);
        // Choose storage without blocking on auth: Firestore if already authed, else local AsyncStorage
        storeRef.current = await FirestoreRepository.createForCurrentUser();

        const data = await storeRef.current.load();
        notesRef.current.hydrate(data);
        const created = notesRef.current.ensureAtLeastOneNote();
        setState(notesRef.current.getState()); // Initial state sync

        if (created) {
          const createdPayload = { ...notesRef.current.getState(), lastWriteBy: id };
          await storeRef.current.save(createdPayload);
        }
        setStatus({ type: 'saved', msg: 'Synced' });
      } catch (e) {
        console.error('Initialization failed:', e);
        setStatus({ type: null, msg: 'Failed to load' });
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Actions
  const addNote = useCallback(() => {
    notesRef.current.addNote();
    refresh();
    persist();
  }, [persist, refresh]);

  const selectNote = useCallback((id) => {
    const changed = notesRef.current.selectNote(id);
    if (changed) {
      refresh();
      persist();
    }
  }, [persist, refresh]);

  const isDirty = useMemo(() => {
    const sel = notesRef.current?.getSelected();
    const t = (sel && sel.title) || '';
    const c = (sel && sel.content) || '';
    return draftTitle !== t || draftContent !== c;
  }, [draftTitle, draftContent]);

  const saveDraft = useCallback(async () => {
    const sel = notesRef.current.getSelected();
    if (!sel || !notesRef.current) return;
    notesRef.current.updateTitle(sel.id, draftTitle);
    notesRef.current.updateContent(sel.id, draftContent);
    await persist();
    refresh();
    setStatus({ type: 'saved', msg: 'Saved' });
  }, [draftTitle, draftContent, persist, refresh]);

  const confirmUnsavedThen = useCallback((proceed) => {
    if (!isDirty) {
      proceed && proceed();
      return;
    }
    Alert.alert(
      'Unsaved changes',
      'You have unsaved changes. Save before leaving?',
      [
        { text: 'Discard', style: 'destructive', onPress: () => { proceed && proceed(); } },
        { text: 'Save', onPress: async () => { await saveDraft(); proceed && proceed(); } },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, [isDirty, saveDraft]);

  const onCopyNote = useCallback(async (id) => {
    const note = notesRef.current?.state.notes.find(n => n.id === id);
    if (!note) return;
    const text = `${note.title || 'Untitled'}\n${note.content || ''}`;
    try {
      await clipRef.current.writeText(text);
      setStatus({ type: 'saved', msg: 'Copied note' });
    } catch {
      setStatus({ type: null, msg: 'Copy failed' });
    }
  }, []);

  const onDeleteNote = useCallback((id) => {
    const note = notesRef.current?.state.notes.find(n => n.id === id);
    if (!note) return;

    const promptDelete = () => {
      Alert.alert(
        'Delete note',
        `Delete note "${note.title || 'Untitled'}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              notesRef.current.deleteNote(id);
              if (notesRef.current.state.notes.length === 0) {
                notesRef.current.ensureAtLeastOneNote();
              }
              refresh();
              persist();
            }
          }
        ]
      );
    };

    // If deleting the currently selected note and there are unsaved edits, confirm first
    if (notesRef.current?.state.selectedId === id && isDirty) {
      Alert.alert(
        'Unsaved changes',
        'Save your changes before deleting?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => promptDelete() },
          { text: 'Save', onPress: async () => { await saveDraft(); promptDelete(); } },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    promptDelete();
  }, [persist, refresh, isDirty, saveDraft]);

  const toggleTheme = useCallback(() => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    notesRef.current.setTheme(next);
    refresh();
    persist();
  }, [persist, refresh, state.theme]);

  const copyAll = useCallback(async () => {
    const allText = notesRef.current?.state.notes
      .map(n => `${n.title || 'Untitled'}\n${n.content || ''}`)
      .join('\n\n---\n\n');
    try {
      await clipRef.current.writeText(allText);
      setStatus({ type: 'saved', msg: 'Copied all notes' });
    } catch {
      setStatus({ type: null, msg: 'Copy failed' });
    }
  }, []);

  const clearAll = useCallback(() => {
    Alert.alert(
      'Clear all notes',
      'Delete all notes? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: async () => {
            notesRef.current.clearAll();
            notesRef.current.ensureAtLeastOneNote();
            refresh();
            await persist();
          }
        }
      ]
    );
  }, [persist, refresh]);

  // Sync drafts when the selected note changes
  useEffect(() => {
    if (!isReady) return;
    const sel = notesRef.current?.getSelected();
    setDraftTitle((sel && sel.title) || '');
    setDraftContent((sel && sel.content) || '');
  }, [state.selectedId, isReady]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading notes...</Text>
        </View>
      </SafeAreaProvider>
    );
  }
  const selected = notesRef.current?.getSelected();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} translucent={false} />

        {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.headerBtnText, { color: theme.colors.text }]}>≡</Text>
        </Pressable>

        <TextInput
          style={[
            styles.headerTitleInput,
            { color: theme.colors.text, backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }
          ]}
          value={draftTitle}
          onChangeText={(txt) => {
            setDraftTitle(txt);
            setStatus({ type: null, msg: 'Unsaved changes' });
          }}
          placeholder="Untitled note"
          placeholderTextColor={theme.colors.subtext}
        />

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => selected && onCopyNote(selected.id)}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.headerBtnText, { color: theme.colors.text }]}>📋</Text>
          </Pressable>
          <Pressable
            onPress={() => selected && onDeleteNote(selected.id)}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.headerBtnText, { color: theme.colors.danger }]}>🗑</Text>
          </Pressable>
        </View>
      </View>


      {/* Editor */}
      <Editor
        value={draftContent}
        onChangeText={(txt) => {
          setDraftContent(txt);
          setStatus({ type: null, msg: 'Unsaved changes' });
        }}
        theme={theme}
      />

      {/* Status */}
      <StatusText statusType={status.type} message={status.msg} theme={theme} />

      {/* Options Menu */}
      <OptionsMenu
        visible={menuOpen}
        onRequestClose={() => setMenuOpen(false)}
        onAdd={() => {
          confirmUnsavedThen(() => {
            addNote();
            setMenuOpen(false);
          });
        }}
        notes={state.notes}
        selectedId={state.selectedId}
        onSelect={(id) => {
          confirmUnsavedThen(() => {
            selectNote(id);
            setMenuOpen(false);
          });
        }}
        onToggleTheme={toggleTheme}
        onCopyAll={copyAll}
        onLoginRequested={() => setLoginOpen(true)}
        theme={theme}
        currentTheme={state.theme}
      />
        <LoginModal
          visible={loginOpen}
          onClose={() => setLoginOpen(false)}
          theme={theme}
          onSuccess={async (user) => {
            try {
              setLoginOpen(false);
              setStatus({ type: null, msg: 'Loading your notes...' });

              // Switch repository to the authenticated user and reload
              setClientId(user.uid);
              storeRef.current = new FirestoreRepository(user.uid);
              const data = await storeRef.current.load();
              notesRef.current.hydrate(data);
              const created = notesRef.current.ensureAtLeastOneNote();
              setState(notesRef.current.getState());
              if (created) {
                const createdPayload = { ...notesRef.current.getState(), lastWriteBy: user.uid };
                await storeRef.current.save(createdPayload);
              }
              setStatus({ type: 'saved', msg: 'Logged in' });
            } catch (e) {
              console.error('Post-login load failed:', e);
              setStatus({ type: null, msg: 'Login succeeded, but loading failed' });
            }
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1
  },
  headerIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6
  },
  headerTitleInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
    borderRadius: 6
  },
  headerBtnText: {
    fontSize: 20
  }
});
