import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { colors } from '../constants/theme';
import { isAppLockEnabled, verifyAppPasscode } from '../services/privacy';

export function AppPrivacyGuard({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const authenticating = useRef(false);
  const appState = useRef(AppState.currentState);

  const unlockWithBiometrics = useCallback(async () => {
    if (authenticating.current) return;
    const enabled = await isAppLockEnabled();
    if (!enabled) {
      setLocked(false);
      setReady(true);
      return;
    }
    const available = await LocalAuthentication.hasHardwareAsync() && await LocalAuthentication.isEnrolledAsync();
    setBiometricsAvailable(available);
    setReady(true);
    if (!available) return;
    authenticating.current = true;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'ปลดล็อก Keep Going',
        cancelLabel: 'ใช้รหัสสำรอง',
        fallbackLabel: 'ใช้รหัสสำรอง',
        disableDeviceFallback: true,
      });
      if (result.success) {
        setLocked(false);
        setPasscode('');
        setError('');
      }
    } finally {
      authenticating.current = false;
    }
  }, []);

  useEffect(() => {
    const configurePrivacy = async () => {
      if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(0.85);
      if (Platform.OS === 'android') await ScreenCapture.preventScreenCaptureAsync('keep-going-privacy');
    };
    configurePrivacy().catch(() => undefined);
    return () => {
      if (Platform.OS === 'ios') ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => undefined);
      if (Platform.OS === 'android') ScreenCapture.allowScreenCaptureAsync('keep-going-privacy').catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    isAppLockEnabled().then((enabled) => {
      setLocked(enabled);
      setReady(true);
      if (enabled) unlockWithBiometrics();
    });
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current === 'inactive' || appState.current === 'background';
      if (nextState === 'inactive' || nextState === 'background') setLocked(true);
      if (wasInactive && nextState === 'active') unlockWithBiometrics();
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [unlockWithBiometrics]);

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
      <Text style={styles.subtitle}>ใช้ข้อมูลบนอุปกรณ์นี้เพื่อกลับเข้าสู่บันทึกของคุณ</Text>
      {biometricsAvailable ? <Pressable onPress={unlockWithBiometrics} style={styles.biometric}><Text style={styles.biometricText}>ใช้ Face ID / Touch ID</Text></Pressable> : null}
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>หรือใช้รหัสสำรอง</Text><View style={styles.line} /></View>
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
  biometric: { width: '100%', minHeight: 52, backgroundColor: colors.primary, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  biometricText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  divider: { width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#E7DCDF' },
  or: { color: '#A99A9E', fontSize: 10, marginHorizontal: 12 },
  input: { width: '100%', height: 58, borderWidth: 1, borderColor: '#E2D5D8', backgroundColor: '#FFF', borderRadius: 16, color: colors.text, fontSize: 24, letterSpacing: 13, paddingLeft: 13 },
  error: { color: '#B65F6A', fontSize: 11, marginTop: 9 },
  unlock: { width: '100%', minHeight: 50, borderRadius: 16, backgroundColor: '#F0E2E5', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  unlockText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  private: { color: '#AAA0A2', fontSize: 10, marginTop: 20 },
});
