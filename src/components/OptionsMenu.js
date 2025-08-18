import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { shortTitle } from '../utils/shortTitle';

export default function OptionsMenu({
  visible,
  onRequestClose,
  onAdd,
  notes,
  selectedId,
  onSelect,
  onToggleTheme,
  onCopyAll,
  theme,
  currentTheme
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose}>
      <Pressable style={styles.backdrop} onPress={onRequestClose}>
        <View />
      </Pressable>

      <View style={[styles.drawer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Pressable
          style={styles.actionItem}
          onPress={() => {
            onAdd && onAdd();
            onRequestClose && onRequestClose();
          }}
        >
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>＋ Create new note</Text>
        </Pressable>

        <View style={[styles.sectionHeader, { borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.subtext }]}>Notes</Text>
        </View>

        <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {(notes && notes.length > 0) ? (
            notes.map((n) => {
              const active = n.id === selectedId;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => {
                    onSelect && onSelect(n.id);
                  }}
                  style={({ pressed }) => [
                    styles.noteItem,
                    active && { borderColor: theme.colors.primary, backgroundColor: theme.colors.inputBg },
                    pressed && { opacity: 0.85 }
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.noteText, { color: active ? theme.colors.text : theme.colors.tabInactive }]}
                  >
                    {shortTitle(n.title)}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.subtext }]}>No notes yet</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderColor: theme.colors.border }]}>
          <Pressable
            style={styles.actionItem}
            onPress={() => {
              onToggleTheme && onToggleTheme();
              onRequestClose && onRequestClose();
            }}
          >
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              {currentTheme === 'dark' ? '🌞 Light theme' : '🌙 Dark theme'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.actionItem}
            onPress={() => {
              onCopyAll && onCopyAll();
              onRequestClose && onRequestClose();
            }}
          >
            <Text style={[styles.actionText, { color: theme.colors.text }]}>📋 Copy all notes</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 280,
    borderRightWidth: 1,
    paddingTop: 12,
    paddingBottom: 8
  },
  actionItem: {
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600'
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4
  },
  sectionHeaderText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingVertical: 4
  },
  noteItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4
  },
  noteText: {
    fontSize: 14
  },
  empty: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  emptyText: {
    fontSize: 14
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 6
  }
});
