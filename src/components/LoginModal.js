import React, { useCallback, useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import AuthService from '../services/AuthService';

export default function LoginModal({ visible, onClose, onSuccess, theme }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(() => (mode === 'login' ? 'Log in' : 'Register'), [mode]);
  const submitLabel = title;

  const submit = useCallback(async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const user =
        mode === 'login'
          ? await AuthService.signInWithEmail(email.trim(), password)
          : await AuthService.signUpWithEmail(email.trim(), password);
      onSuccess && onSuccess(user);
      setEmail('');
      setPassword('');
    } catch (e) {
      setError(e?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  }, [email, password, mode, onSuccess]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.subtext }]}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.subtext}
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }
            ]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.subtext }]}>Password</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.subtext}
            style={[
              styles.input,
              { color: theme.colors.text, backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border }
            ]}
          />
        </View>

        {!!error && <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text>}

        <Pressable
          onPress={submit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.colors.primary },
            (pressed || submitting) && { opacity: 0.85 }
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>{submitLabel}</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ color: theme.colors.text }}>
            {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Log in'}
          </Text>
        </Pressable>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={{ color: theme.colors.subtext }}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  card: {
    position: 'absolute',
    top: '22%',
    left: 20,
    right: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  field: {
    marginBottom: 10
  },
  label: {
    fontSize: 12,
    marginBottom: 6
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16
  },
  error: {
    marginTop: 4,
    marginBottom: 8
  },
  primaryBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 10
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 6
  }
});
