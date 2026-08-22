import { useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

const feelings = [
  { emoji: '😢', label: 'ยังเสียใจมาก' },
  { emoji: '💭', label: 'ยังคิดถึงเขาบ่อย' },
  { emoji: '😔', label: 'รู้สึกเหงาและว่างเปล่า' },
  { emoji: '😠', label: 'ยังโกรธหรือผิดหวัง' },
  { emoji: '🌱', label: 'เริ่มดีขึ้นบ้างแล้ว' },
];

export function FeelingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FeelingQuestion'>>();
  const [feeling, setFeeling] = useState<string | null>(null);
  const next = () => feeling
    ? navigation.navigate('FeelingReasonQuestion', { days: route.params.days, feeling })
    : Alert.alert('เลือกความรู้สึกก่อนนะ', 'เลือกข้อที่ใกล้กับความรู้สึกของคุณที่สุด');

  return (
    <Screen contentStyle={styles.screen} resetScrollOnFocus backgroundColor="#F9F1EE">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  ย้อนกลับ</Text></Pressable>
      <View style={styles.progress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /><View style={styles.progressIdle} /></View>
      <Text style={styles.step}>คำถาม 2 จาก 5</Text>
      <Text style={styles.title}>ตอนนี้ความรู้สึกไหนชัดที่สุดในใจคุณ?</Text>
      <Text style={styles.hint}>เลือกข้อที่ใกล้กับความรู้สึกตอนนี้มากที่สุด ไม่มีคำตอบที่ผิด</Text>
      <View style={styles.options}>{feelings.map((item) => (
        <Pressable key={item.label} onPress={() => setFeeling(item.label)} style={[styles.option, feeling === item.label && styles.selectedOption]}>
          <Text style={styles.emoji}>{item.emoji}</Text><Text style={[styles.label, feeling === item.label && styles.selectedText]}>{item.label}</Text><View style={[styles.radio, feeling === item.label && styles.selectedRadio]} />
        </Pressable>
      ))}</View>
      <Pressable onPress={next} style={styles.button}><Text style={styles.buttonText}>ถัดไป</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 20, backgroundColor: '#F9F1EE' }, back: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 }, backText: { color: colors.primary, fontSize: 15, fontWeight: '700' }, progress: { flexDirection: 'row', gap: 7, marginTop: 13 }, progressActive: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }, progressIdle: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E8DADD' }, step: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 25 }, title: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '800', marginTop: 8 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }, options: { gap: 12, marginTop: 27 }, option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 17 }, selectedOption: { borderColor: '#C98193', backgroundColor: '#FFF2F5' }, emoji: { fontSize: 26, marginRight: 13 }, label: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' }, selectedText: { color: '#6A3F4B' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#C9BCC0' }, selectedRadio: { borderWidth: 5, borderColor: colors.primary }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 25 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
