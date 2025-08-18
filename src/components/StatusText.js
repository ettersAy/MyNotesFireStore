import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function StatusText({ statusType, message, theme }) {
  if (!message) return null;
  const color = statusType === 'saving'
    ? theme.colors.primary
    : statusType === 'saved'
    ? theme.colors.accent
    : theme.colors.subtext;
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    alignItems: 'center'
  },
  text: {
    fontSize: 12
  }
});
