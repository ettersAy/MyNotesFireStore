import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { shortTitle } from '../utils/shortTitle';

export default function Tabs({
  notes,
  selectedId,
  onSelect,
  onTitleInput,
  onCopy,
  onDelete,
  theme
}) {
  const activeInputRef = useRef(null);

  useEffect(() => {
    // Focus caret at end when active tab changes
    if (activeInputRef.current) {
      const input = activeInputRef.current;
      // setNativeProps to move caret end is not trivial; focusing is good enough UX
      input.focus();
    }
  }, [selectedId]);

  return (
    <View style={[styles.wrapper, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
        {notes.map(n => {
          const active = n.id === selectedId;
          return (
            <Pressable
              key={n.id}
              onPress={() => onSelect && onSelect(n.id)}
              style={[
                styles.tab,
                { borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.inputBg }
              ]}
            >
              <View style={styles.tabInner}>
                {active ? (
                  <TextInput
                    ref={activeInputRef}
                    style={[styles.titleInput, { color: theme.colors.text }]}
                    value={n.title || ''}
                    onChangeText={(txt) => onTitleInput && onTitleInput(n.id, txt)}
                    placeholder="Untitled note"
                    placeholderTextColor={theme.colors.subtext}
                  />
                ) : (
                  <Text
                    numberOfLines={1}
                    style={[styles.titleText, { color: theme.colors.tabInactive }]}
                  >
                    {shortTitle(n.title)}
                  </Text>
                )}
                {active && (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onCopy && onCopy(n.id);
                      }}
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={[styles.icon, { color: theme.colors.text }]}>📋</Text>
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onDelete && onDelete(n.id);
                      }}
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={[styles.icon, { color: theme.colors.danger }]}>🗑</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    paddingVertical: 8
  },
  container: {
    paddingHorizontal: 8,
    alignItems: 'center'
  },
  tab: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    minWidth: 120,
    maxWidth: 220
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 14,
    flexShrink: 1
  },
  titleInput: {
    fontSize: 14,
    paddingVertical: 0,
    paddingHorizontal: 0,
    flex: 1
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8
  },
  iconBtn: {
    marginLeft: 6
  },
  icon: {
    fontSize: 16
  }
});
