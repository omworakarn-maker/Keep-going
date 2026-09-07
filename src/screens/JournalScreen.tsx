import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { PaperBackground } from '../components/PaperBackground';
import { colors, moods } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Mood } from '../types';
import { formatThaiDate, isoToday } from '../utils/date';

const encouragements: Record<string, { emoji: string; title: string; message: string }> = {
  'ดีขึ้น': { emoji: '☀️', title: 'วันนี้ใจมีแสงขึ้นอีกนิดแล้วนะ', message: 'เก็บความรู้สึกดีนี้ไว้กับตัวเองนะ' },
  'สงบ': { emoji: '🍃', title: 'ความสงบเล็ก ๆ นี้มีความหมาย', message: 'แค่ได้พักอยู่กับตัวเองตรงนี้ก็เพียงพอแล้ว' },
  'คิดถึง': { emoji: '🌧️', title: 'คิดถึงได้ ไม่ได้แปลว่าถอยหลัง', message: 'การยอมรับความรู้สึกตามตรงคือการดูแลตัวเองแล้ว' },
  'เหนื่อย': { emoji: '🌙', title: 'วันนี้ไม่ต้องเข้มแข็งตลอดก็ได้', message: 'คุณเดินมาไกลพอที่จะให้ตัวเองได้พักบ้างแล้ว' },
  'หนักใจ': { emoji: '🫧', title: 'ขอบคุณที่ไม่เก็บไว้คนเดียว', message: 'คุณไม่จำเป็นต้องแก้ทุกเรื่องให้เสร็จภายในวันนี้' },
};

export function JournalScreen() {
  const router = useRouter();
  const { addEntry, addDiaryEntry, entries, diaryEntries } = useApp();
  const [mode, setMode] = useState<'checkin' | 'diary'>('checkin');
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diaryMood, setDiaryMood] = useState<Mood>();
  const [encouragementMood, setEncouragementMood] = useState<string | null>(null);
  const todayEntry = entries.find((entry) => entry.date === isoToday());
  const encouragement = encouragementMood ? encouragements[encouragementMood] : null;

  const saveCheckin = () => {
    if (!mood) return Alert.alert('เลือกความรู้สึกก่อนนะ', 'เลือกอารมณ์ที่ใกล้กับวันนี้ที่สุด');
    if (!note.trim()) return Alert.alert('เขียนอีกนิดไหม', 'ลองบอกตัวเองสั้น ๆ ว่าวันนี้เป็นอย่างไร');
    addEntry(mood, note.trim()); setMood(null); setNote(''); setEncouragementMood(mood.label);
  };

  const saveDiary = () => {
    if (!content.trim()) return Alert.alert('ยังไม่มีข้อความ', 'เขียนสิ่งที่อยู่ในใจก่อนบันทึกนะ');
    addDiaryEntry(title, content, diaryMood); setTitle(''); setContent(''); setDiaryMood(undefined);
    Alert.alert('เก็บไว้ให้แล้ว', 'บันทึกนี้อยู่ในเรื่องราวของคุณแล้ว');
  };

  return <>
    <Screen animateOnFocus={false}>
      <Text style={styles.pageTitle}>เขียนบันทึก</Text><Text style={styles.pageSubtitle}>พื้นที่นี้เป็นของคุณทั้งหมด</Text>
      <View style={styles.segment}><Segment label="เช็กอิน" selected={mode === 'checkin'} onPress={() => setMode('checkin')} /><Segment label="ไดอารี" selected={mode === 'diary'} onPress={() => setMode('diary')} /></View>
      <Pressable onPress={() => router.push('/ReleaseLetter')} style={styles.letterCard}><View style={styles.letterIcon}><Text style={styles.letterEmoji}>✉️</Text></View><View style={styles.letterBody}><Text style={styles.letterEyebrow}>พื้นที่ปล่อยความรู้สึก</Text><Text style={styles.letterTitle}>เขียนจดหมายที่ไม่ต้องส่ง</Text><Text style={styles.letterHint}>เลือกเก็บไว้ หรือปล่อยไปโดยไม่มีใครได้รับ</Text></View><Text style={styles.letterArrow}>›</Text></Pressable>
      {mode === 'checkin' ? (todayEntry ? <Completed entry={todayEntry} /> : <View>
        <Text style={styles.heading}>วันนี้ใจเป็นอย่างไรบ้าง?</Text><Text style={styles.subheading}>ไม่ต้องเข้มแข็งทุกวันก็ได้นะ</Text>
        <MoodPicker value={mood} onChange={setMood} />
        <View style={styles.card}><Text style={styles.prompt}>วันนี้คุณดูแลตัวเองเรื่องอะไร?</Text><TextInput value={note} onChangeText={setNote} multiline placeholder="เขียนได้ทุกอย่าง ไม่มีคำตอบที่ผิด..." placeholderTextColor="#A19A9D" style={styles.checkinInput} textAlignVertical="top" /><SaveButton label="บันทึกวันนี้" onPress={saveCheckin} /></View>
        <View style={styles.gentle}><Text style={styles.gentleTitle}>ถ้าวันนี้เผลอคิดถึงเขา...</Text><Text style={styles.gentleText}>มันไม่ได้แปลว่าคุณกลับไปจุดเดิม การมูฟออนไม่ได้เป็นเส้นตรง</Text></View>
      </View>) : <View>
        <View style={styles.diaryHeader}><View><Text style={styles.heading}>ไดอารีของฉัน</Text><Text style={styles.diaryDate}>{formatToday()}</Text><Text style={styles.subheading}>เขียนได้ทุกเมื่อ ไม่จำกัดจำนวนครั้ง</Text></View><Text style={styles.count}>{diaryEntries.length} บันทึก</Text></View>
        <View style={styles.paperCard}><TextInput value={title} onChangeText={setTitle} placeholder="หัวข้อ (ไม่บังคับ)" placeholderTextColor="#A19A9D" style={styles.titleInput} /><View style={styles.divider} /><View style={styles.linedInput}><PaperBackground lines={10} /><TextInput value={content} onChangeText={setContent} multiline placeholder="วันนี้มีอะไรอยู่ในใจบ้าง..." placeholderTextColor="#A19A9D" style={styles.diaryInput} textAlignVertical="top" /></View>
          <Text style={styles.optional}>ความรู้สึกในบันทึกนี้ · ไม่บังคับ</Text><View style={styles.compactMoods}>{moods.map((item) => <Pressable key={item.label} onPress={() => setDiaryMood(diaryMood?.label === item.label ? undefined : item)} style={[styles.compactMood, diaryMood?.label === item.label && { backgroundColor: item.color }]}><Text style={styles.compactEmoji}>{item.emoji}</Text><Text style={[styles.compactLabel, diaryMood?.label === item.label && styles.compactLabelSelected]}>{item.label}</Text></Pressable>)}</View>
          <SaveButton label="เก็บบันทึกนี้ไว้" onPress={saveDiary} />
        </View><Text style={styles.privacy}>บันทึกทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น</Text>
      </View>}
    </Screen>
    <Modal visible={Boolean(encouragement)} transparent animationType="fade" onRequestClose={() => setEncouragementMood(null)}><View style={styles.backdrop}><View style={styles.modalCard}><View style={styles.handle} /><Text style={styles.modalEmoji}>{encouragement?.emoji}</Text><Text style={styles.eyebrow}>ข้อความสำหรับใจของคุณ</Text><Text style={styles.modalTitle}>{encouragement?.title}</Text><Text style={styles.modalMessage}>{encouragement?.message}</Text><SaveButton label="รับข้อความนี้ไว้" onPress={() => setEncouragementMood(null)} /></View></View></Modal>
  </>;
}

function Segment({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.segmentButton, selected && styles.segmentSelected]}><Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text></Pressable>; }
function formatToday() { return new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function SaveButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.button}><Text style={styles.buttonText}>{label}</Text></Pressable>; }
function MoodPicker({ value, onChange }: { value: Mood | null; onChange: (mood: Mood) => void }) { return <View style={styles.moods}>{moods.map((item) => <Pressable key={item.label} onPress={() => onChange(item)} style={[styles.mood, value?.label === item.label && { backgroundColor: item.color }]}><Text style={styles.emoji}>{item.emoji}</Text><Text style={styles.label}>{item.label}</Text></Pressable>)}</View>; }
function Completed({ entry }: { entry: { emoji: string; mood: string; date: string; note: string } }) { return <View><View style={styles.completed}><Text style={styles.completedEmoji}>💌</Text><Text style={styles.completedTitle}>วันนี้คุณได้ตอบไปแล้ว</Text><Text style={styles.completedText}>ถ้ายังมีอะไรอยู่ในใจ คุณเขียนต่อในไดอารีได้เสมอ</Text></View><Text style={styles.savedLabel}>บันทึกของวันนี้</Text><View style={styles.saved}><Text style={styles.savedEmoji}>{entry.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.savedMeta}>{entry.mood} · {formatThaiDate(entry.date)}</Text><Text style={styles.savedNote}>{entry.note}</Text></View></View></View>; }

const styles = StyleSheet.create({
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 15 }, pageSubtitle: { color: colors.muted, marginTop: 5 }, segment: { flexDirection: 'row', backgroundColor: '#F0E7E9', borderRadius: 14, padding: 4, marginTop: 22, marginBottom: 26 }, segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 }, segmentSelected: { backgroundColor: '#FFF', shadowColor: '#76545E', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }, segmentText: { color: colors.muted, fontSize: 14, fontWeight: '700' }, segmentTextSelected: { color: colors.primary, fontWeight: '800' }, heading: { color: colors.text, fontSize: 21, fontWeight: '800' }, subheading: { color: colors.muted, marginTop: 5, marginBottom: 20 }, moods: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }, mood: { width: '18%', alignItems: 'center', borderRadius: 16, paddingVertical: 10 }, emoji: { fontSize: 25 }, label: { color: '#665B60', fontSize: 11, marginTop: 4 }, card: { backgroundColor: colors.card, borderRadius: 22, padding: 18 }, paperCard: { overflow: 'hidden', position: 'relative', backgroundColor: '#FFFDF4', borderRadius: 8, padding: 18, borderWidth: 1, borderColor: '#E8E2D3', shadowColor: '#65584B', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 }, prompt: { color: colors.text, fontSize: 17, fontWeight: '800' }, checkinInput: { height: 150, color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 10 }, button: { width: '100%', backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', padding: 14, marginTop: 14 }, buttonText: { color: '#FFF', fontWeight: '800' }, gentle: { backgroundColor: '#F0F3EA', borderRadius: 18, padding: 18, marginTop: 18 }, gentleTitle: { color: '#52614D', fontWeight: '800' }, gentleText: { color: '#6D7868', lineHeight: 21, marginTop: 5 }, diaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, diaryDate: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 5 }, count: { color: colors.primary, fontSize: 12, fontWeight: '800', backgroundColor: '#F7E9ED', padding: 7, borderRadius: 12 }, titleInput: { color: colors.text, fontSize: 18, fontWeight: '700', paddingVertical: 7 }, divider: { height: 1, backgroundColor: '#D8DDD5', marginTop: 8 }, linedInput: { position: 'relative', height: 280, marginTop: 16 }, diaryInput: { ...StyleSheet.absoluteFillObject, color: colors.text, fontSize: 16, lineHeight: 28, padding: 0, margin: 0 }, optional: { color: colors.muted, fontSize: 12, marginTop: 14 }, compactMoods: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 10 }, compactMood: { width: '48%', minHeight: 46, flexDirection: 'row', borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(247,242,241,0.9)', paddingHorizontal: 10 }, compactEmoji: { fontSize: 20, marginRight: 7 }, compactLabel: { color: '#71666A', fontSize: 13, fontWeight: '700' }, compactLabelSelected: { color: colors.text, fontWeight: '800' }, privacy: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 14 }, completed: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 24, padding: 26 }, completedEmoji: { fontSize: 44 }, completedTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 12 }, completedText: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 7 }, savedLabel: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 25, marginBottom: 12 }, saved: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 18, padding: 17 }, savedEmoji: { fontSize: 28, marginRight: 12 }, savedMeta: { color: colors.primary, fontSize: 13, fontWeight: '700' }, savedNote: { color: colors.text, lineHeight: 22, marginTop: 6 }, backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(52,42,47,0.42)' }, modalCard: { backgroundColor: '#FFF9F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 34, alignItems: 'center' }, handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#DDCFD2', marginBottom: 20 }, modalEmoji: { fontSize: 48 }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 14 }, modalTitle: { color: colors.text, fontSize: 23, fontWeight: '800', textAlign: 'center', marginTop: 9 }, modalMessage: { color: '#756A6E', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 11 },
  letterCard: { minHeight: 94, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7F2', borderWidth: 1, borderColor: '#EADDD7', borderRadius: 20, padding: 14, marginTop: -10, marginBottom: 24 }, letterIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1DDE2' }, letterEmoji: { fontSize: 23 }, letterBody: { flex: 1, marginLeft: 12 }, letterEyebrow: { color: '#A77B86', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 }, letterTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 3 }, letterHint: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, letterArrow: { color: colors.primary, fontSize: 29, marginLeft: 8 },
});
