import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('กรอกอีเมลให้ถูกต้อง');
    if (signup && password.length < 8) return setError('ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร');
    if (!password) return setError('กรอกรหัสผ่านก่อนนะ');
    setBusy(true);
    try { if (signup) await register(name, email, password); else await login(email, password); }
    catch (e) { setError(e instanceof Error ? e.message : 'ลองใหม่อีกครั้ง'); }
    finally { setBusy(false); setPassword(''); }
  };
  return <Screen animateOnFocus={false}><View style={styles.content}>
    <Text style={styles.brand}>KEEP GOING</Text>
    <Text style={styles.title}>{signup ? 'เริ่มต้นพื้นที่ของคุณ' : 'ยินดีที่ได้พบกันอีก'}</Text>
    <Text style={styles.subtitle}>{signup ? 'สร้างบัญชีเพื่อเริ่มการเดินทางของคุณ' : 'เข้าสู่ระบบเพื่อกลับมาดูแลใจ'}</Text>
    {signup && <TextInput accessibilityLabel="ชื่อ" value={name} onChangeText={setName} placeholder="ชื่อของคุณ (ไม่บังคับ)" style={styles.input} editable={!busy} />}
    <TextInput accessibilityLabel="อีเมล" value={email} onChangeText={setEmail} placeholder="อีเมล" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} textContentType="username" style={styles.input} editable={!busy} />
    <TextInput accessibilityLabel="รหัสผ่าน" value={password} onChangeText={setPassword} placeholder={signup ? 'รหัสผ่านอย่างน้อย 8 ตัวอักษร' : 'รหัสผ่าน'} key={signup ? 'signup-password' : 'login-password'} secureTextEntry autoCapitalize="none" autoCorrect={false} spellCheck={false} textContentType="none" autoComplete="off" importantForAutofill="no" style={styles.input} editable={!busy} onSubmitEditing={submit} />
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Pressable disabled={busy} onPress={submit} style={[styles.button, busy && { opacity: 0.6 }]}>{busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{signup ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</Text>}</Pressable>
    <Pressable disabled={busy} onPress={() => { setSignup(!signup); setError(''); setPassword(''); }}><Text style={styles.link}>{signup ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}</Text></Pressable>
  </View></Screen>;
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: 'center', gap: 16, paddingVertical: 60 }, brand: { color: colors.primary, letterSpacing: 4, fontWeight: '700' }, title: { color: colors.text, fontSize: 30, fontWeight: '700' }, subtitle: { color: colors.muted, marginBottom: 20 }, input: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, fontSize: 16, color: colors.text }, button: { backgroundColor: colors.primary, borderRadius: 18, padding: 18, alignItems: 'center' }, buttonText: { color: 'white', fontWeight: '700', fontSize: 17 }, error: { color: '#A33A4A' }, link: { color: colors.primary, textAlign: 'center', padding: 12 } });
