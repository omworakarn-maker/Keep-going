import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/date';

export function SettingsScreen() {
  const { startDate, updateStartDate, resetApp } = useApp();
  const [draftDate, setDraftDate] = useState(startDate);

  const saveDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draftDate) || Number.isNaN(new Date(draftDate).getTime())) {
      return Alert.alert('รูปแบบวันที่ไม่ถูกต้อง', 'ใช้รูปแบบ YYYY-MM-DD เช่น 2026-08-01');
    }
    updateStartDate(draftDate);
    Alert.alert('บันทึกแล้ว', 'อัปเดตวันเริ่ม No Contact แล้ว');
  };

  const confirmReset = () => Alert.alert('เริ่มต้นแอพใหม่?', 'คำตอบและ journal ทั้งหมดจะถูกลบจากเครื่อง', [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: 'ลบและเริ่มใหม่', style: 'destructive', onPress: resetApp },
  ]);

  return (
    <Screen>
      <Text style={styles.title}>ตั้งค่า</Text>
      <Text style={styles.subtitle}>ปรับพื้นที่นี้ให้ตรงกับการเดินทางของคุณ</Text>
      <View style={styles.card}>
        <Text style={styles.label}>วันเริ่ม No Contact</Text>
        <Text style={styles.current}>{formatThaiDate(startDate)}</Text>
        <TextInput value={draftDate} onChangeText={setDraftDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" style={styles.input} />
        <Pressable onPress={saveDate} style={styles.button}><Text style={styles.buttonText}>บันทึกวันที่</Text></Pressable>
      </View>
      <View style={styles.privacyCard}><Text style={styles.privacyTitle}>🔒 ข้อมูลเป็นส่วนตัว</Text><Text style={styles.privacyText}>ข้อมูลทั้งหมดเก็บอยู่ในอุปกรณ์นี้ ยังไม่มีการส่งขึ้นเซิร์ฟเวอร์</Text></View>
      <Pressable onPress={confirmReset} style={styles.reset}><Text style={styles.resetText}>ลบข้อมูลและทำแบบสอบถามใหม่</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 18 }, subtitle: { color: colors.muted, marginTop: 6, marginBottom: 24 }, card: { backgroundColor: colors.card, borderRadius: 20, padding: 18 }, label: { color: colors.text, fontSize: 17, fontWeight: '800' }, current: { color: colors.primary, marginTop: 5 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, fontSize: 16, color: colors.text, marginTop: 15 }, button: { backgroundColor: colors.primary, borderRadius: 13, alignItems: 'center', padding: 13, marginTop: 10 }, buttonText: { color: '#FFF', fontWeight: '800' }, privacyCard: { backgroundColor: '#F0F3EA', borderRadius: 18, padding: 17, marginTop: 16 }, privacyTitle: { color: '#52614D', fontWeight: '800' }, privacyText: { color: '#6D7868', lineHeight: 20, marginTop: 5 }, reset: { alignItems: 'center', padding: 15, marginTop: 22 }, resetText: { color: '#B35D68', fontWeight: '700' },
});
