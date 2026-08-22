import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { isoToday } from '../utils/date';

const messages = [
  { title: 'วันนี้ไม่ต้องเก่งไปกว่านี้ก็ได้', body: 'แค่ยังเลือกดูแลหัวใจตัวเองอยู่ ก็ถือว่าคุณเดินต่อแล้ว', note: 'ค่อย ๆ ไปในจังหวะของคุณนะ' },
  { title: 'คุณไม่จำเป็นต้องหายดีในทันที', body: 'บางวันดีขึ้น บางวันคิดถึง ทั้งสองแบบยังเป็นส่วนหนึ่งของการก้าวต่อไป', note: 'วันนี้อ่อนโยนกับตัวเองอีกนิดนะ' },
  { title: 'ความคิดถึงไม่ใช่คำสั่งให้ย้อนกลับไป', body: 'คุณรับรู้มันได้ แล้วเลือกอยู่ข้างตัวเองตรงนี้ต่อได้เหมือนกัน', note: 'ใจของคุณกำลังเรียนรู้ทีละวัน' },
  { title: 'วันธรรมดาก็เป็นความก้าวหน้า', body: 'ไม่จำเป็นต้องมีเหตุการณ์ใหญ่ แค่ผ่านวันนี้ด้วยความใส่ใจตัวเองก็เพียงพอ', note: 'Keep Going อยู่ตรงนี้กับคุณ' },
  { title: 'คุณยังมีสิทธิ์พบวันที่เบากว่านี้', body: 'สิ่งที่เกิดขึ้นเป็นเพียงส่วนหนึ่งของเรื่องราว ไม่ใช่ทั้งหมดของชีวิตคุณ', note: 'ขอให้วันนี้มีช่วงเวลาที่เป็นของคุณ' },
  { title: 'พักได้ โดยไม่ต้องรู้สึกผิด', body: 'การหยุดหายใจและวางบางเรื่องลงชั่วคราว ไม่ได้ทำให้คุณถอยหลัง', note: 'คุณไม่ต้องแบกทุกอย่างพร้อมกัน' },
  { title: 'ขอบคุณที่ยังอยู่ข้างตัวเอง', body: 'แม้ใจจะยังไม่แน่ใจ แต่ทุกครั้งที่คุณกลับมารับฟังตัวเองคือก้าวสำคัญ', note: 'วันนี้ก็ยังนับนะ' },
];

const moodLines: Record<string, string> = {
  'ดีขึ้น': 'เก็บแสงเล็ก ๆ จากเมื่อวานไว้กับตัวเองนะ',
  'สงบ': 'ความสงบที่คุณพบมีความหมายเสมอ',
  'คิดถึง': 'คิดถึงได้ โดยไม่ต้องกลับไปทำร้ายหัวใจตัวเอง',
  'เหนื่อย': 'วันนี้ลดความคาดหวังลงแล้วพักบ้างก็ได้',
  'หนักใจ': 'คุณไม่จำเป็นต้องแก้ทุกอย่างภายในวันนี้',
};

export function DailyWelcome() {
  const { hasOnboarded, lastDailyWelcomeDate, dismissDailyWelcome, entries } = useApp();
  const today = isoToday();
  const dayNumber = Math.floor(new Date(`${today}T12:00:00`).getTime() / 86400000);
  const message = messages[dayNumber % messages.length];
  const latestMoodLine = entries[0] ? moodLines[entries[0].mood] : null;
  const visible = hasOnboarded && lastDailyWelcomeDate !== today;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismissDailyWelcome}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.mark}><View style={styles.markDot} /></View>
          <Text style={styles.dateLabel}>ข้อความประจำวันนี้</Text>
          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.body}>{message.body}</Text>
          {latestMoodLine ? <View style={styles.moodNote}><Text style={styles.moodText}>{latestMoodLine}</Text></View> : null}
          <Text style={styles.note}>{message.note}</Text>
          <Pressable onPress={dismissDailyWelcome} style={styles.button}>
            <Text style={styles.buttonText}>เริ่มวันนี้อย่างค่อยเป็นค่อยไป</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', paddingHorizontal: 25, backgroundColor: 'rgba(54,45,49,0.32)' },
  card: { backgroundColor: '#FFFDFC', borderRadius: 28, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 22, alignItems: 'center', shadowColor: '#4B3940', shadowOpacity: 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
  mark: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F6E8EC', alignItems: 'center', justifyContent: 'center' },
  markDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
  dateLabel: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 17 },
  title: { color: colors.text, fontSize: 24, lineHeight: 33, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  body: { color: '#766B6F', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12 },
  moodNote: { width: '100%', backgroundColor: '#F4F3ED', borderRadius: 15, padding: 14, marginTop: 18 },
  moodText: { color: '#62695D', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  note: { color: '#9A8D91', fontSize: 12, textAlign: 'center', marginTop: 18 },
  button: { width: '100%', backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center', paddingVertical: 15, marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
