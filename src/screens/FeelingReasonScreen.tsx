import { useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

const reasonsByFeeling: Record<string, string[]> = {
  'ยังเสียใจมาก': [
    'ยังยอมรับสิ่งที่เกิดขึ้นไม่ได้',
    'มีหลายเรื่องที่ยังค้างคาใจ',
    'คิดถึงอนาคตที่เคยวางไว้ด้วยกัน',
    'รู้สึกว่าตัวเองสูญเสียสิ่งสำคัญ',
    'ไม่แน่ใจเหมือนกัน',
    'อื่น ๆ',
  ],
  'ยังคิดถึงเขาบ่อย': [
    'คิดถึงช่วงเวลาดี ๆ ที่เคยมีร่วมกัน',
    'เห็นสถานที่หรือสิ่งที่ทำให้นึกถึงเขา',
    'เผลอเข้าไปดูเรื่องราวของเขา',
    'มีเรื่องที่อยากเล่าให้เขาฟัง',
    'ความคิดถึงเกิดขึ้นมาเอง',
    'อื่น ๆ',
  ],
  'รู้สึกเหงาและว่างเปล่า': [
    'ไม่คุ้นกับการต้องอยู่คนเดียว',
    'คิดถึงคนที่เคยคุยด้วยทุกวัน',
    'รู้สึกว่าไม่มีใครเข้าใจ',
    'มีเวลาว่างแล้วไม่รู้จะทำอะไร',
    'บรรยากาศรอบตัวทำให้รู้สึกเหงา',
    'อื่น ๆ',
  ],
  'ยังโกรธหรือผิดหวัง': [
    'ยังติดใจกับสิ่งที่เขาทำ',
    'มีคำพูดที่ยังทำให้เจ็บ',
    'รู้สึกว่าตัวเองไม่ได้รับความเป็นธรรม',
    'ผิดหวังที่ความสัมพันธ์ไม่เป็นอย่างที่หวัง',
    'ยังมีสิ่งที่อยากพูดกับเขา',
    'อื่น ๆ',
  ],
  'เริ่มดีขึ้นบ้างแล้ว': [
    'เริ่มกลับมาใช้เวลากับตัวเอง',
    'มีคนรอบตัวคอยรับฟังและดูแล',
    'ไม่ได้ติดตามเรื่องของเขาเหมือนเดิม',
    'เริ่มยอมรับสิ่งที่เกิดขึ้นได้',
    'พบสิ่งใหม่ที่ทำให้มีความสุข',
    'อื่น ๆ',
  ],
};

export function FeelingReasonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FeelingReasonQuestion'>>();
  const reasons = reasonsByFeeling[route.params.feeling] ?? ['ไม่แน่ใจเหมือนกัน', 'อื่น ๆ'];
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const next = () => reason
    ? navigation.navigate('HealingGoalQuestion', { days: route.params.days, feeling: route.params.feeling, feelingReason: reason, feelingNote: note.trim() })
    : Alert.alert('เลือกเหตุผลอีกนิดนะ', 'เลือกสิ่งที่ทำให้คุณรู้สึกแบบนี้มากที่สุด');

  return (
    <Screen contentStyle={styles.screen} resetScrollOnFocus backgroundColor="#F9F1EE">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  ย้อนกลับ</Text></Pressable>
      <View style={styles.progress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /></View>
      <Text style={styles.step}>คำถาม 3 จาก 5</Text>
      <Text style={styles.title}>อะไรทำให้คุณรู้สึกว่า “{route.params.feeling}” มากที่สุด?</Text>
      <Text style={styles.hint}>เลือกข้อที่ใกล้กับความรู้สึกของคุณที่สุด</Text>
      <View style={styles.options}>{reasons.map((item) => (
        <Pressable key={item} onPress={() => setReason(item)} style={[styles.option, reason === item && styles.selectedOption]}>
          <Text style={[styles.label, reason === item && styles.selectedText]}>{item}</Text><View style={[styles.radio, reason === item && styles.selectedRadio]} />
        </Pressable>
      ))}</View>
      <Text style={styles.noteLabel}>อยากเล่าเพิ่มเติมไหม <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
      <TextInput value={note} onChangeText={setNote} multiline maxLength={500} placeholder="เขียนสิ่งที่อยู่ในใจได้ตรงนี้..." placeholderTextColor="#A19A9D" style={styles.input} textAlignVertical="top" />
      <Pressable onPress={next} style={styles.button}><Text style={styles.buttonText}>ถัดไป</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 20, backgroundColor: '#F9F1EE' }, back: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 }, backText: { color: colors.primary, fontSize: 15, fontWeight: '700' }, progress: { flexDirection: 'row', gap: 7, marginTop: 13 }, progressActive: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }, progressIdle: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E8DADD' }, step: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 25 }, title: { color: colors.text, fontSize: 27, lineHeight: 37, fontWeight: '800', marginTop: 8 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }, options: { gap: 10, marginTop: 25 }, option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }, selectedOption: { borderColor: '#C98193', backgroundColor: '#FFF2F5' }, label: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' }, selectedText: { color: '#6A3F4B' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#C9BCC0' }, selectedRadio: { borderWidth: 5, borderColor: colors.primary }, noteLabel: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 25, marginBottom: 10 }, optional: { color: colors.muted, fontSize: 13, fontWeight: '500' }, input: { minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: '#FFF', color: colors.text, fontSize: 15, lineHeight: 22, padding: 15 }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 25 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
