import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

const ranges = [
  { label: '1–2 วัน', detail: 'เพิ่งเริ่มต้น', days: 1, emoji: '🌱' },
  { label: '3–7 วัน', detail: 'ประมาณหนึ่งสัปดาห์', days: 5, emoji: '🌿' },
  { label: '1–2 สัปดาห์', detail: 'กำลังค่อย ๆ ปรับตัว', days: 10, emoji: '🍃' },
  { label: '1–4 เดือน', detail: 'เดินมาไกลพอสมควรแล้ว', days: 30, emoji: '🌷' },
  { label: '5 เดือนขึ้นไป', detail: 'คุณผ่านหลายอย่างมาแล้ว', days: 150, emoji: '🌳' },
];

export function NoContactScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState<number | null>(null);
  const next = () => selected === null ? Alert.alert('เลือกช่วงเวลาก่อนนะ', 'เลือกช่วงที่ใกล้เคียงที่สุดได้เลย') : navigation.navigate('FeelingQuestion', { days: selected });

  return (
    <Screen contentStyle={styles.screen} resetScrollOnFocus backgroundColor="#F9F1EE">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  ย้อนกลับ</Text></Pressable>
      <View style={styles.progress}><View style={styles.progressActive} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /></View>
      <Text style={styles.step}>คำถาม 1 จาก 5</Text>
      <Text style={styles.title}>เราไม่ได้คุยกันมานานแค่ไหนแล้ว?</Text>
      <Text style={styles.hint}>เลือกช่วงที่ใกล้เคียงที่สุด ไม่จำเป็นต้องจำวันที่แน่นอน</Text>
      <View style={styles.options}>{ranges.map((range) => (
        <Pressable key={range.label} onPress={() => setSelected(range.days)} style={[styles.option, selected === range.days && styles.selectedOption]}>
          <Text style={styles.emoji}>{range.emoji}</Text><View style={styles.body}><Text style={[styles.label, selected === range.days && styles.selectedText]}>{range.label}</Text><Text style={styles.detail}>{range.detail}</Text></View><View style={[styles.radio, selected === range.days && styles.selectedRadio]} />
        </Pressable>
      ))}</View>
      <Pressable onPress={next} style={styles.button}><Text style={styles.buttonText}>ถัดไป</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 20, backgroundColor: '#F9F1EE' }, back: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 }, backText: { color: colors.primary, fontSize: 15, fontWeight: '700' }, progress: { flexDirection: 'row', gap: 7, marginTop: 13 }, progressActive: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }, progressIdle: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E8DADD' }, step: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 25 }, title: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '800', marginTop: 8 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }, options: { gap: 11, marginTop: 25 }, option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 15 }, selectedOption: { borderColor: '#C98193', backgroundColor: '#FFF2F5' }, emoji: { fontSize: 25, marginRight: 12 }, body: { flex: 1 }, label: { color: colors.text, fontSize: 16, fontWeight: '700' }, detail: { color: colors.muted, fontSize: 12, marginTop: 3 }, selectedText: { color: '#6A3F4B' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#C9BCC0' }, selectedRadio: { borderWidth: 5, borderColor: colors.primary }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 25 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
