import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatThaiDate } from '../utils/date';
import { disableAppLock, enableAppLock, isAppLockEnabled, verifyAppPasscode } from '../services/privacy';

export function SettingsScreen() {
  const { startDate, updateStartDate, allowEarlyWeeklySummary, setAllowEarlyWeeklySummary, selfReasons, addSelfReason, updateSelfReason, deleteSelfReason, resetApp } = useApp();
  const [draftDate, setDraftDate] = useState(startDate);
  const [reasonDraft, setReasonDraft] = useState('');
  const [editingReason, setEditingReason] = useState<number | null>(null);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [lockModal, setLockModal] = useState<'enable' | 'disable' | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [savingLock, setSavingLock] = useState(false);

  useEffect(() => { isAppLockEnabled().then(setLockEnabled); }, []);

  const closeLockModal = () => { setLockModal(null); setPin(''); setConfirmPin(''); setPinError(''); };
  const changeLock = () => { setLockModal(lockEnabled ? 'disable' : 'enable'); setPin(''); setConfirmPin(''); setPinError(''); };
  const submitLock = async () => {
    if (!/^\d{4}$/.test(pin)) return setPinError('ตั้งรหัสตัวเลขให้ครบ 4 หลัก');
    if (lockModal === 'enable' && pin !== confirmPin) return setPinError('รหัสทั้งสองครั้งไม่ตรงกัน');
    setSavingLock(true);
    try {
      if (lockModal === 'enable') {
        await enableAppLock(pin);
        setLockEnabled(true);
        closeLockModal();
        Alert.alert('เปิดการล็อกแล้ว', 'ครั้งถัดไปที่เปิดแอป ระบบจะใช้ Face ID / Touch ID หรือรหัสสำรองนี้');
      } else {
        if (!await verifyAppPasscode(pin)) return setPinError('รหัสสำรองไม่ถูกต้อง');
        await disableAppLock();
        setLockEnabled(false);
        closeLockModal();
        Alert.alert('ปิดการล็อกแล้ว');
      }
    } finally {
      setSavingLock(false);
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
      <View style={styles.patienceCard}><View style={styles.patienceCopy}><Text style={styles.patienceTitle}>เปิดสรุปก่อนวันอาทิตย์</Text><Text style={styles.patienceText}>{allowEarlyWeeklySummary ? 'เปิดดูภาพรวมระหว่างสัปดาห์ได้' : 'รอให้สัปดาห์นี้เก็บเรื่องราวของคุณให้ครบก่อน'}</Text></View><Switch value={allowEarlyWeeklySummary} onValueChange={setAllowEarlyWeeklySummary} trackColor={{ false: '#DDD2D5', true: '#D8AAB6' }} thumbColor={allowEarlyWeeklySummary ? colors.primary : '#FFFFFF'} /></View>
      <View style={styles.lockCard}><View style={styles.lockRow}><View style={styles.lockCopy}><Text style={styles.lockEyebrow}>ความเป็นส่วนตัว</Text><Text style={styles.lockTitle}>ล็อก Keep Going</Text><Text style={styles.lockText}>{lockEnabled ? 'เปิดอยู่ · ใช้ข้อมูลบนอุปกรณ์หรือรหัสสำรอง' : 'ปกป้องบันทึกเมื่อกลับมาเปิดแอป'}</Text></View><Switch value={lockEnabled} onValueChange={changeLock} trackColor={{ false: '#DDD2D5', true: '#D8AAB6' }} thumbColor={lockEnabled ? colors.primary : '#FFFFFF'} /></View>{lockEnabled ? <Pressable onPress={() => setLockModal('enable')} style={styles.changePin}><Text style={styles.changePinText}>เปลี่ยนรหัสสำรอง</Text></Pressable> : null}</View>
      <View style={styles.privacyCard}><Text style={styles.privacyTitle}>🔒 ข้อมูลเป็นส่วนตัว</Text><Text style={styles.privacyText}>เช็กอิน ไดอารี ข้อความที่ไม่ได้ส่ง เหตุผลที่เลือกตัวเอง และการตั้งค่า เก็บอยู่ในอุปกรณ์นี้ด้วย AsyncStorage</Text><Text style={styles.privacyText}>ไฟล์เสียงเก็บในพื้นที่เอกสารของแอป ส่วนรหัสสำรองเก็บแยกใน SecureStore และไม่มีข้อมูลส่วนตัวถูกส่งขึ้นเซิร์ฟเวอร์</Text><View style={styles.privacyDivider} /><Text style={styles.protectionText}>เมื่อออกจากแอป เนื้อหาจะถูกปิดบังใน App Switcher โดยอัตโนมัติ</Text></View>
      <Pressable onPress={confirmReset} style={styles.reset}><Text style={styles.resetText}>ลบข้อมูลและทำแบบสอบถามใหม่</Text></Pressable>
      <Modal visible={Boolean(lockModal)} transparent animationType="fade" onRequestClose={closeLockModal}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.modalEyebrow}>{lockModal === 'enable' ? 'ตั้งค่าความเป็นส่วนตัว' : 'ยืนยันว่าเป็นคุณ'}</Text><Text style={styles.modalTitle}>{lockModal === 'enable' ? (lockEnabled ? 'เปลี่ยนรหัสสำรอง' : 'สร้างรหัสสำรอง 4 หลัก') : 'กรอกรหัสเพื่อปิดการล็อก'}</Text><Text style={styles.modalText}>{lockModal === 'enable' ? 'รหัสนี้ใช้เมื่อ Face ID หรือ Touch ID ไม่พร้อม' : 'ข้อมูลจะยังอยู่ในเครื่องเหมือนเดิม แต่แอปจะไม่ถามรหัสอีก'}</Text><TextInput value={pin} onChangeText={(value) => { setPin(value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }} keyboardType="number-pad" secureTextEntry maxLength={4} placeholder="รหัส 4 หลัก" placeholderTextColor="#B4A6AA" style={styles.pinInput} />{lockModal === 'enable' ? <TextInput value={confirmPin} onChangeText={(value) => { setConfirmPin(value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }} keyboardType="number-pad" secureTextEntry maxLength={4} placeholder="ยืนยันรหัสอีกครั้ง" placeholderTextColor="#B4A6AA" style={styles.pinInput} /> : null}{pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}<Pressable onPress={submitLock} disabled={savingLock} style={[styles.modalSave, savingLock && styles.modalDisabled]}><Text style={styles.modalSaveText}>{savingLock ? 'กำลังบันทึก...' : lockModal === 'enable' ? 'บันทึกรหัสและเปิดการล็อก' : 'ยืนยันและปิดการล็อก'}</Text></Pressable><Pressable onPress={closeLockModal} style={styles.modalCancel}><Text style={styles.modalCancelText}>ยกเลิก</Text></Pressable></View></KeyboardAvoidingView></Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 27, fontWeight: '800', marginTop: 18 }, subtitle: { color: colors.muted, marginTop: 6, marginBottom: 24 }, card: { backgroundColor: colors.card, borderRadius: 20, padding: 18 }, label: { color: colors.text, fontSize: 17, fontWeight: '800' }, current: { color: colors.primary, marginTop: 5 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, fontSize: 16, color: colors.text, marginTop: 15 }, button: { backgroundColor: colors.primary, borderRadius: 13, alignItems: 'center', padding: 13, marginTop: 10 }, buttonText: { color: '#FFF', fontWeight: '800' }, patienceCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEF0', borderRadius: 18, padding: 17, marginTop: 16 }, patienceCopy: { flex: 1, paddingRight: 12 }, patienceTitle: { color: colors.text, fontSize: 15, fontWeight: '800' }, patienceText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 5 }, privacyCard: { backgroundColor: '#F0F3EA', borderRadius: 18, padding: 17, marginTop: 16 }, privacyTitle: { color: '#52614D', fontWeight: '800' }, privacyText: { color: '#6D7868', lineHeight: 20, marginTop: 5 }, reset: { alignItems: 'center', padding: 15, marginTop: 22 }, resetText: { color: '#B35D68', fontWeight: '700' },
  lockCard: { backgroundColor: '#F7EEF0', borderRadius: 18, padding: 17, marginTop: 16 }, lockRow: { flexDirection: 'row', alignItems: 'center' }, lockCopy: { flex: 1, paddingRight: 12 }, lockEyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 }, lockTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 4 }, lockText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 4 }, changePin: { alignSelf: 'flex-start', paddingTop: 13 }, changePinText: { color: colors.primary, fontSize: 11, fontWeight: '800' }, privacyDivider: { height: 1, backgroundColor: '#DDE5D7', marginVertical: 12 }, protectionText: { color: '#52614D', fontSize: 11, lineHeight: 18, fontWeight: '700' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(50,42,46,0.4)' }, modalCard: { backgroundColor: '#FFF9F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 34 }, modalEyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 }, modalTitle: { color: colors.text, fontSize: 22, lineHeight: 30, fontWeight: '800', marginTop: 7 }, modalText: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 8 }, pinInput: { height: 52, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: '#FFF', color: colors.text, fontSize: 17, paddingHorizontal: 15, marginTop: 10 }, pinError: { color: '#B65F6A', fontSize: 11, marginTop: 8 }, modalSave: { minHeight: 50, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 15 }, modalDisabled: { opacity: 0.55 }, modalSaveText: { color: '#FFF', fontSize: 13, fontWeight: '800' }, modalCancel: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 3 }, modalCancelText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  reasonCard: { backgroundColor: '#FFF8F5', borderRadius: 20, borderWidth: 1, borderColor: '#EADADD', padding: 18, marginTop: 16 }, reasonEyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, reasonTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 5 }, reasonDescription: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 7 }, reasonInput: { minHeight: 50, borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 14, marginTop: 15 }, reasonButton: { minHeight: 46, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 9 }, reasonButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }, cancelEdit: { alignItems: 'center', paddingTop: 10 }, cancelEditText: { color: colors.muted, fontSize: 11, fontWeight: '700' }, reasonList: { borderTopWidth: 1, borderTopColor: '#EFE2E4', marginTop: 18, paddingTop: 7 }, reasonRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 9 }, reasonDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D99CAB', marginTop: 7, marginRight: 10 }, reasonText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 }, reasonAction: { paddingLeft: 10, paddingVertical: 2 }, editText: { color: colors.primary, fontSize: 10, fontWeight: '800' }, deleteText: { color: '#B56A72', fontSize: 10, fontWeight: '800' }, reasonEmpty: { color: '#A99A9E', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
