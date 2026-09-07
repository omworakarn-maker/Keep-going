import { useRef, useState } from 'react';
import { Alert, Animated, Easing, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

type Result = 'kept' | 'released' | null;

export function ReleaseLetterScreen() {
  const router = useRouter();
  const { addUrgeEntry } = useApp();
  const [recipient, setRecipient] = useState('');
  const [letter, setLetter] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [saving, setSaving] = useState(false);
  const paperOpacity = useRef(new Animated.Value(1)).current;
  const paperLift = useRef(new Animated.Value(0)).current;

  const keepLetter = async () => {
    if (!letter.trim()) return Alert.alert('จดหมายยังว่างอยู่', 'เขียนสิ่งที่อยากบอกก่อนนะ');
    if (saving) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await addUrgeEntry(letter, null, undefined, 'letter', recipient);
      setResult('kept');
    } catch {
      Alert.alert('ยังเก็บจดหมายไม่ได้', 'ลองอีกครั้งนะ');
    } finally {
      setSaving(false);
    }
  };

  const releaseLetter = () => {
    if (!letter.trim()) return Alert.alert('จดหมายยังว่างอยู่', 'เขียนสิ่งที่อยากปล่อยไว้ก่อนนะ');
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(paperOpacity, { toValue: 0, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(paperLift, { toValue: -28, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      setLetter('');
      setRecipient('');
      setResult('released');
      paperLift.setValue(10);
      Animated.parallel([
        Animated.timing(paperOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(paperLift, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]).start();
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerSide}><Text style={styles.back}>‹ ย้อนกลับ</Text></Pressable>
            <Text style={styles.brand}>KEEP GOING</Text>
            <Pressable onPress={() => router.back()} hitSlop={12} style={[styles.headerSide, styles.headerRight]}><Text style={styles.close}>ปิด</Text></Pressable>
          </View>

          <Animated.View style={[styles.content, { opacity: paperOpacity, transform: [{ translateY: paperLift }] }]}>
            {result ? (
              <View style={styles.result}>
                <Text style={styles.resultEmoji}>{result === 'kept' ? '💌' : '🍃'}</Text>
                <Text style={styles.resultTitle}>{result === 'kept' ? 'เก็บจดหมายไว้ให้แล้ว' : 'คุณปล่อยความรู้สึกนี้ไปแล้วนะ'}</Text>
                <Text style={styles.resultText}>{result === 'kept' ? 'จดหมายจะรอคุณอยู่ในหน้าย้อนหลัง โดยไม่ถูกส่งไปหาใคร' : 'ไม่มีข้อความใดถูกบันทึกหรือส่งออกไป คุณไม่จำเป็นต้องถือมันไว้ตลอดก็ได้'}</Text>
                <Pressable onPress={() => router.back()} style={styles.primary}><Text style={styles.primaryText}>กลับไปดูแลวันนี้ของฉัน</Text></Pressable>
              </View>
            ) : (
              <>
                <View style={styles.headingBlock}>
                  <Text style={styles.eyebrow}>จดหมายที่ไม่ต้องส่ง</Text>
                  <Text style={styles.title}>เขียนทุกอย่างที่ใจยังพูดไม่จบ</Text>
                  <Text style={styles.subtitle}>พื้นที่นี้ไม่มีคำตอบที่ผิด และจดหมายจะไม่ถูกส่งไปหาใคร</Text>
                </View>
                <View style={styles.paper}>
                  <TextInput value={recipient} onChangeText={setRecipient} placeholder="ถึง... (ไม่บังคับ)" placeholderTextColor="#A99E99" returnKeyType="next" style={styles.recipient} />
                  <View style={styles.rule} />
                  <TextInput value={letter} onChangeText={setLetter} multiline autoFocus placeholder="เขียนสิ่งที่อยากบอกไว้ตรงนี้..." placeholderTextColor="#B1A7A2" textAlignVertical="top" style={styles.letterInput} />
                  <Text style={styles.date}>{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={keepLetter} disabled={saving} style={[styles.primary, saving && styles.disabled]}><Text style={styles.primaryText}>{saving ? 'กำลังเก็บ...' : 'เก็บไว้ในย้อนหลัง'}</Text></Pressable>
                  <Pressable onPress={releaseLetter} style={styles.release}><Text style={styles.releaseText}>ปล่อยจดหมายนี้ไป</Text></Pressable>
                </View>
                <Text style={styles.privacy}>ทั้งสองตัวเลือกจะไม่ส่งข้อความไปหาใคร</Text>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF9F5' },
  flex: { flex: 1 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerSide: { width: 84, height: 44, justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end' },
  back: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  close: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  brand: { color: '#AA979C', fontSize: 11, fontWeight: '800', letterSpacing: 2.4 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 14 },
  headingBlock: { marginBottom: 18 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 26, lineHeight: 35, fontWeight: '800', marginTop: 7 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 6 },
  paper: { flex: 1, minHeight: 280, backgroundColor: '#FFFDF4', borderWidth: 1, borderColor: '#E7DFD0', borderRadius: 10, paddingHorizontal: 19, paddingTop: 15, paddingBottom: 12, shadowColor: '#65584B', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  recipient: { color: colors.text, fontSize: 17, fontWeight: '700', paddingVertical: 8 },
  rule: { height: 1, backgroundColor: '#DDD7CB', marginTop: 3 },
  letterInput: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 28, paddingTop: 15, paddingHorizontal: 0 },
  date: { color: '#A99E99', fontSize: 10, textAlign: 'right', marginTop: 8 },
  actions: { marginTop: 13 },
  primary: { minHeight: 52, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryText: { color: '#FFF', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  disabled: { opacity: 0.55 },
  release: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  releaseText: { color: '#A46877', fontSize: 13, fontWeight: '800' },
  privacy: { color: '#A99A9E', fontSize: 10, textAlign: 'center' },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  resultEmoji: { fontSize: 58 },
  resultTitle: { color: colors.text, fontSize: 25, lineHeight: 34, fontWeight: '800', textAlign: 'center', marginTop: 20 },
  resultText: { color: colors.muted, fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: 12, marginBottom: 30 },
});
