import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

export default function Editor({ value, onChangeText, theme }) {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder="Write your note here..."
        placeholderTextColor={theme.colors.subtext}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    flex: 1
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1
  }
});
