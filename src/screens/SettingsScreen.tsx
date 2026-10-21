import { Switch } from 'react-native-paper';
import { MySpaceTools } from '../components/MySpaceTools';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatThaiDate } from '../utils/date';
import { disableGentleNotifications, parseReminderTime, scheduleGentleNotifications } from '../services/notifications';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const { startDate, updateStartDate, allowEarlyWeeklySummary, setAllowEarlyWeeklySummary, selfReasons, addSelfReason, updateSelfReason, deleteSelfReason, notificationsEnabled, notificationTime, setNotificationSettings, resetApp } = useApp();
  const [draftDate, setDraftDate] = useState(startDate);
  const [reasonDraft, setReasonDraft] = useState('');
  const [editingReason, setEditingReason] = useState<number | null>(null);
  const [reminderTime, setReminderTime] = useState(notificationTime);
  const [savingReminder, setSavingReminder] = useState(false);

  useEffect(() => { setReminderTime(notificationTime); }, [notificationTime]);

  const changeNotifications = async (enabled: boolean) => {
    if (!enabled) {
      await disableGentleNotifications();
      setNotificationSettings(false, reminderTime);
      return;
    }
    const time = parseReminderTime(reminderTime);
    if (!time) return Alert.alert('เวลาไม่ถูกต้อง', 'กรอกเวลาแบบ 24 ชั่วโมง เช่น 20:30');
    setSavingReminder(true);
    try {
      const result = await scheduleGentleNotifications(time.hour, time.minute);
      if (result === 'denied') return Alert.alert('ยังเปิดการแจ้งเตือนไม่ได้', 'อนุญาตการแจ้งเตือนให้ Keep Going ในการตั้งค่าของเครื่อง แล้วลองอีกครั้งนะ');
      setNotificationSettings(true, reminderTime);
      Alert.alert('ตั้งเวลาแล้ว', `Keep Going จะเตือนอย่างอ่อนโยนวันละครั้ง เวลา ${reminderTime} น.`);
    } catch {
      Alert.alert('ตั้งการแจ้งเตือนไม่สำเร็จ', 'ลองอีกครั้งเมื่อพร้อมนะ');
    } finally {
      setSavingReminder(false);
    }
  };

  const saveReminderTime = async () => {
    const time = parseReminderTime(reminderTime);
    if (!time) return Alert.alert('เวลาไม่ถูกต้อง', 'กรอกเวลาแบบ 24 ชั่วโมง เช่น 20:30');
    if (!notificationsEnabled) {
      setNotificationSettings(false, reminderTime);
      return Alert.alert('บันทึกเวลาแล้ว', 'เปิดสวิตช์เมื่อคุณอยากรับการเตือนนะ');
    }
    setSavingReminder(true);
    try {
      await scheduleGentleNotifications(time.hour, time.minute, false);
      setNotificationSettings(true, reminderTime);
      Alert.alert('อัปเดตเวลาแล้ว', `เตือนวันละครั้ง เวลา ${reminderTime} น.`);
    } finally {
      setSavingReminder(false);
    }
  };

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

  const saveReason = () => {
    const value = reasonDraft.trim();
    if (!value) return Alert.alert('ลองเขียนเหตุผลสั้น ๆ ก่อนนะ');
    if (selfReasons.some((reason, index) => index !== editingReason && reason.toLocaleLowerCase() === value.toLocaleLowerCase())) return Alert.alert('เหตุผลนี้อยู่กับคุณแล้ว');
    if (editingReason === null) addSelfReason(value); else updateSelfReason(editingReason, value);
    setReasonDraft('');
    setEditingReason(null);
  };

  const editReason = (index: number) => { setEditingReason(index); setReasonDraft(selfReasons[index]); };
  const removeReason = (index: number) => Alert.alert('ลบเหตุผลนี้?', 'คุณเพิ่มเหตุผลใหม่กลับมาได้เสมอ', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ลบ', style: 'destructive', onPress: () => { deleteSelfReason(index); if (editingReason === index) { setEditingReason(null); setReasonDraft(''); } } }]);

  return (
    <Screen animateOnFocus={false}>
      <Text style={styles.title}>ตั้งค่า</Text>
      <Text style={styles.subtitle}>ปรับพื้นที่นี้ให้ตรงกับการเดินทางของคุณ</Text>
      <View style={styles.card}>
        <Text style={styles.label}>{user?.fullName || 'บัญชีของฉัน'}</Text>
        <Text style={styles.current}>{user?.email}</Text>
        <Pressable onPress={() => Alert.alert('ออกจากระบบ?', 'บันทึกยังอยู่ในอุปกรณ์นี้', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ออกจากระบบ', onPress: () => { void logout(); } }])} style={styles.button}><Text style={styles.buttonText}>ออกจากระบบ</Text></Pressable>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>วันเริ่ม No Contact</Text>
        <Text style={styles.current}>{formatThaiDate(startDate)}</Text>
        <TextInput value={draftDate} onChangeText={setDraftDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" style={styles.input} />
        <Pressable onPress={saveDate} style={styles.button}><Text style={styles.buttonText}>บันทึกวันที่</Text></Pressable>
      </View>
      <View style={styles.reasonCard}>
        <Text style={styles.reasonEyebrow}>พื้นที่เตือนใจ</Text>
        <Text style={styles.reasonTitle}>เหตุผลที่ฉันเลือกตัวเอง</Text>
        <Text style={styles.reasonDescription}>เขียนสิ่งที่อยากจำไว้ในวันที่ใจเริ่มลังเล เพิ่มได้มากเท่าที่คุณต้องการ</Text>
        <TextInput value={reasonDraft} onChangeText={setReasonDraft} placeholder="เช่น ฉันอยากกลับมายิ้มได้อีกครั้ง" placeholderTextColor="#B4A6AA" returnKeyType="done" onSubmitEditing={saveReason} style={styles.reasonInput} />
        <Pressable onPress={saveReason} style={styles.reasonButton}><Text style={styles.reasonButtonText}>{editingReason === null ? 'เพิ่มเหตุผลนี้' : 'บันทึกการแก้ไข'}</Text></Pressable>
        {editingReason !== null ? <Pressable onPress={() => { setEditingReason(null); setReasonDraft(''); }} style={styles.cancelEdit}><Text style={styles.cancelEditText}>ยกเลิกการแก้ไข</Text></Pressable> : null}
        {selfReasons.length ? <View style={styles.reasonList}>{selfReasons.map((reason, index) => <View key={`${reason}-${index}`} style={styles.reasonRow}><View style={styles.reasonDot} /><Text style={styles.reasonText}>{reason}</Text><Pressable onPress={() => editReason(index)} hitSlop={8} style={styles.reasonAction}><Text style={styles.editText}>แก้ไข</Text></Pressable><Pressable onPress={() => removeReason(index)} hitSlop={8} style={styles.reasonAction}><Text style={styles.deleteText}>ลบ</Text></Pressable></View>)}</View> : <Text style={styles.reasonEmpty}>เหตุผลแรกของคุณจะอยู่ตรงนี้</Text>}
      </View>
      <View style={styles.patienceCard}><View style={styles.patienceCopy}><Text style={styles.patienceTitle}>เปิดสรุปก่อนวันอาทิตย์</Text><Text style={styles.patienceText}>{allowEarlyWeeklySummary ? 'เปิดดูภาพรวมระหว่างสัปดาห์ได้' : 'รอให้สัปดาห์นี้เก็บเรื่องราวของคุณให้ครบก่อน'}</Text></View><Switch value={allowEarlyWeeklySummary} onValueChange={setAllowEarlyWeeklySummary} color={colors.primary} /></View>
      <View style={styles.notificationCard}>
        <View style={styles.notificationRow}><View style={styles.notificationCopy}><Text style={styles.notificationEyebrow}>การแจ้งเตือนที่อ่อนโยน</Text><Text style={styles.notificationTitle}>เตือนให้กลับมาดูแลตัวเอง</Text><Text style={styles.notificationText}>{notificationsEnabled ? `วันละครั้ง เวลา ${notificationTime} น.` : 'ปิดอยู่ เปิดเมื่อคุณอยากให้เราเตือน'}</Text></View><Switch value={notificationsEnabled} disabled={savingReminder} onValueChange={changeNotifications} color={colors.primary} /></View>
        <View style={styles.timeRow}><TextInput value={reminderTime} onChangeText={(value) => setReminderTime(value.replace(/[^0-9:]/g, '').slice(0, 5))} placeholder="20:00" placeholderTextColor="#B4A6AA" keyboardType="numbers-and-punctuation" maxLength={5} style={styles.timeInput} /><Pressable onPress={saveReminderTime} disabled={savingReminder} style={[styles.timeButton, savingReminder && styles.modalDisabled]}><Text style={styles.timeButtonText}>{savingReminder ? 'กำลังบันทึก' : 'บันทึกเวลา'}</Text></Pressable></View>
        <Text style={styles.notificationPrivacy}>ข้อความเตือนจะเป็นข้อความกลาง ๆ และจะไม่แสดงอารมณ์ ไดอารี่ หรือข้อมูลความสัมพันธ์บนหน้าจอล็อก</Text>
      </View>
      <MySpaceTools />
      <View style={styles.privacyCard}><Text style={styles.privacyTitle}>🔒 ข้อมูลเป็นส่วนตัว</Text><Text style={styles.privacyText}>เช็กอิน ไดอารี ข้อความที่ไม่ได้ส่ง เหตุผลที่เลือกตัวเอง และการตั้งค่า จะซิงก์กับบัญชีของคุณผ่าน Supabase พร้อมเก็บสำเนาไว้ในอุปกรณ์</Text><Text style={styles.privacyText}>ไฟล์เสียงเก็บในพื้นที่ส่วนตัวของบัญชี และผู้ใช้อื่นไม่สามารถเปิดดูได้</Text></View>
      <Pressable onPress={() => router.push('/ComponentShowcase')} style={styles.showcaseButton}><View><Text style={styles.showcaseEyebrow}>สำหรับการศึกษา</Text><Text style={styles.showcaseTitle}>ดูตัวอย่าง UI Components</Text><Text style={styles.showcaseText}>IconButton, List, Menu, Portal และอื่น ๆ</Text></View><Text style={styles.showcaseArrow}>›</Text></Pressable>
      <Pressable onPress={confirmReset} style={styles.reset}><Text style={styles.resetText}>ลบข้อมูลและทำแบบสอบถามใหม่</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 18 }, subtitle: { color: colors.muted, marginTop: 6, marginBottom: 24 }, card: { backgroundColor: colors.card, borderRadius: 20, padding: 18 }, label: { color: colors.text, fontSize: 17, fontWeight: '800' }, current: { color: colors.primary, marginTop: 5 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, fontSize: 16, color: colors.text, marginTop: 15 }, button: { backgroundColor: colors.primary, borderRadius: 13, alignItems: 'center', padding: 13, marginTop: 10 }, buttonText: { color: '#FFF', fontWeight: '800' }, patienceCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEF0', borderRadius: 18, padding: 17, marginTop: 16 }, patienceCopy: { flex: 1, paddingRight: 12 }, patienceTitle: { color: colors.text, fontSize: 15, fontWeight: '800' }, patienceText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }, privacyCard: { backgroundColor: '#F0F3EA', borderRadius: 18, padding: 17, marginTop: 16 }, privacyTitle: { color: '#52614D', fontWeight: '800' }, privacyText: { color: '#6D7868', lineHeight: 20, marginTop: 5 }, reset: { alignItems: 'center', padding: 15, marginTop: 22 }, resetText: { color: '#B35D68', fontWeight: '700' },
  notificationCard: { backgroundColor: '#FFF8F2', borderRadius: 18, borderWidth: 1, borderColor: '#EADADD', padding: 17, marginTop: 16 }, notificationRow: { flexDirection: 'row', alignItems: 'center' }, notificationCopy: { flex: 1, paddingRight: 12 }, notificationEyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 }, notificationTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 4 }, notificationText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 }, timeRow: { flexDirection: 'row', gap: 9, marginTop: 14 }, timeInput: { flex: 1, height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: '#FFFFFF', color: colors.text, fontSize: 16, paddingHorizontal: 14 }, timeButton: { minWidth: 112, height: 46, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13 }, timeButtonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' }, notificationPrivacy: { color: '#8A7C80', fontSize: 10, lineHeight: 16, marginTop: 11 },
  modalDisabled: { opacity: 0.55 },
  showcaseButton: { minHeight: 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F4E9ED', borderRadius: 18, padding: 17, marginTop: 16 }, showcaseEyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, showcaseTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 4 }, showcaseText: { color: colors.muted, fontSize: 11, marginTop: 4 }, showcaseArrow: { color: colors.primary, fontSize: 30, fontWeight: '300' },
  reasonCard: { backgroundColor: '#FFF8F5', borderRadius: 20, borderWidth: 1, borderColor: '#EADADD', padding: 18, marginTop: 16 }, reasonEyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, reasonTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 5 }, reasonDescription: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 7 }, reasonInput: { minHeight: 50, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 14, marginTop: 15 }, reasonButton: { minHeight: 46, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 9 }, reasonButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }, cancelEdit: { alignItems: 'center', paddingTop: 10 }, cancelEditText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, reasonList: { borderTopWidth: 1, borderTopColor: '#EFE2E4', marginTop: 18, paddingTop: 7 }, reasonRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9 }, reasonDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D99CAB', marginTop: 7, marginRight: 10 }, reasonText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 }, reasonAction: { paddingLeft: 10, paddingVertical: 2 }, editText: { color: colors.primary, fontSize: 10, fontWeight: '800' }, deleteText: { color: '#B56A72', fontSize: 10, fontWeight: '800' }, reasonEmpty: { color: '#A99A9E', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
