import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../constants/theme';
import { isAppLockEnabled, verifyAppPasscode } from '../services/privacy';

export function AppPrivacyGuard({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const appState = useRef(AppState.currentState);

  const refreshLock = useCallback(async () => {
    const enabled = await isAppLockEnabled();
    setLocked(enabled);
    setReady(true);
  }, []);

  useEffect(() => {
    refreshLock();
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current === 'inactive' || appState.current === 'background';
      if (nextState === 'inactive' || nextState === 'background') setLocked(true);
      if (wasInactive && nextState === 'active') refreshLock();
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [refreshLock]);

  const unlockWithPasscode = async () => {
    if (passcode.length !== 4) return setError('กรอกรหัส 4 หลักก่อนนะ');
    if (await verifyAppPasscode(passcode)) {
      setLocked(false);
      setPasscode('');
      setError('');
    } else {
      setPasscode('');
      setError('รหัสไม่ถูกต้อง ลองอีกครั้งนะ');
    }
  };

  if (!ready) return <View style={styles.loading} />;
  if (!locked) return <>{children}</>;

  return (
    <KeyboardAvoidingView style={styles.locked} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.mark}><Text style={styles.markText}>🌱</Text></View>
      <Text style={styles.brand}>KEEP GOING</Text>
      <Text style={styles.title}>พื้นที่ของคุณถูกล็อกไว้</Text>
      <Text style={styles.subtitle}>กรอกรหัส 4 หลักเพื่อกลับเข้าสู่บันทึกของคุณ</Text>
      <TextInput value={passcode} onChangeText={(value) => { setPasscode(value.replace(/\D/g, '').slice(0, 4)); setError(''); }} keyboardType="number-pad" secureTextEntry maxLength={4} placeholder="••••" placeholderTextColor="#B8ACB0" textAlign="center" style={styles.input} onSubmitEditing={unlockWithPasscode} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={unlockWithPasscode} style={styles.unlock}><Text style={styles.unlockText}>ปลดล็อก</Text></Pressable>
      <Text style={styles.private}>ข้อมูลยังคงอยู่ในอุปกรณ์นี้</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#FFF9F5' },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF9F5', paddingHorizontal: 30 },
  mark: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#F2E4E7', alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 35 },
  brand: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginTop: 20 },
  title: { color: colors.text, fontSize: 25, lineHeight: 33, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  subtitle: { maxWidth: 290, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  input: { width: '100%', height: 58, borderWidth: 1, borderColor: '#E2D5D8', backgroundColor: '#FFF', borderRadius: 16, color: colors.text, fontSize: 24, letterSpacing: 13, paddingLeft: 13, marginTop: 28 },
  error: { color: '#B65F6A', fontSize: 11, marginTop: 9 },
  unlock: { width: '100%', minHeight: 50, borderRadius: 16, backgroundColor: '#F0E2E5', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  unlockText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  private: { color: '#AAA0A2', fontSize: 10, marginTop: 20 },
});
