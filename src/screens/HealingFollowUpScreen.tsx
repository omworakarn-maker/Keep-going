import { useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

type FollowUp = { question: string; hint: string; options: { emoji: string; label: string }[] };

const followUps: Record<string, FollowUp> = {
  'กลับมารักตัวเอง': {
    question: 'ตอนนี้คุณยังแอบเข้าไปส่องเขาอยู่ไหม?',
    hint: 'ตอบตามจริงได้เลย เราไม่ได้ตัดสินคุณ',
    options: [
      { emoji: '📱', label: 'ยังส่องอยู่บ่อย ๆ' },
      { emoji: '🌤️', label: 'ส่องบ้างเป็นบางครั้ง' },
      { emoji: '🌿', label: 'ไม่ได้ส่องแล้ว' },
    ],
  },
  'หยุดวนคิดถึงเขา': {
    question: 'ช่วงไหนที่คุณมักคิดถึงเขามากที่สุด?',
    hint: 'การรู้ช่วงเวลาที่ใจอ่อนล้า จะช่วยให้เราดูแลตัวเองได้ดีขึ้น',
    options: [
      { emoji: '🌙', label: 'ก่อนนอน' },
      { emoji: '🫧', label: 'ตอนอยู่คนเดียว' },
      { emoji: '☁️', label: 'แทบตลอดทั้งวัน' },
    ],
  },
  'รอเขากลับมา': {
    question: 'อะไรทำให้ใจคุณยังเลือกที่จะรอ?',
    hint: 'ความหวังของคุณมีความหมาย และคุณยังดูแลตัวเองระหว่างรอได้',
    options: [
      { emoji: '✨', label: 'ยังเชื่อว่าเรามีโอกาส' },
      { emoji: '🤍', label: 'เขาเคยบอกว่าจะกลับมา' },
      { emoji: '⏳', label: 'ใจยังปล่อยเขาไม่ได้' },
    ],
  },
  'นอนให้ดีขึ้น': {
    question: 'อะไรทำให้คุณนอนไม่หลับบ่อยที่สุด?',
    hint: 'เลือกสิ่งที่ใกล้เคียงกับคืนส่วนใหญ่ของคุณ',
    options: [
      { emoji: '💭', label: 'คิดถึงเรื่องเดิมซ้ำ ๆ' },
      { emoji: '📲', label: 'เผลอเช็กโทรศัพท์' },
      { emoji: '🌑', label: 'รู้สึกว่างเปล่า' },
    ],
  },
  'เริ่มต้นใหม่': {
    question: 'ตอนนี้คุณพร้อมเปิดรับสิ่งใหม่แค่ไหน?',
    hint: 'ไม่ต้องรีบพร้อม การค่อย ๆ ไปก็เป็นคำตอบที่ดี',
    options: [
      { emoji: '🫶', label: 'ยังไม่พร้อม' },
      { emoji: '🌱', label: 'กำลังค่อย ๆ เปิดใจ' },
      { emoji: '🌈', label: 'พร้อมเริ่มต้นใหม่แล้ว' },
    ],
  },
};

export function HealingFollowUpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HealingFollowUp'>>();
  const [answer, setAnswer] = useState<string | null>(null);
  const followUp = followUps[route.params.goal];

  const finish = () => {
    if (!answer) return Alert.alert('เลือกคำตอบก่อนนะ', 'เลือกข้อที่ใกล้กับความรู้สึกของคุณที่สุด');
    navigation.navigate('HealingComfort', { days: route.params.days, feeling: route.params.feeling, feelingReason: route.params.feelingReason, feelingNote: route.params.feelingNote, goal: route.params.goal, answer });
  };

  return (
    <Screen contentStyle={styles.screen} resetScrollOnFocus backgroundColor="#F9F1EE">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  ย้อนกลับ</Text></Pressable>
      <View style={styles.progress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /></View>
      <Text style={styles.step}>คำถาม 5 จาก 5 · {route.params.goal}</Text>
      <Text style={styles.title}>{followUp.question}</Text>
      <Text style={styles.hint}>{followUp.hint}</Text>
      <View style={styles.options}>{followUp.options.map((option) => (
        <Pressable key={option.label} onPress={() => setAnswer(option.label)} style={[styles.option, answer === option.label && styles.selectedOption]}>
          <Text style={styles.emoji}>{option.emoji}</Text>
          <Text style={[styles.label, answer === option.label && styles.selectedText]}>{option.label}</Text>
          <View style={[styles.radio, answer === option.label && styles.selectedRadio]} />
        </Pressable>
      ))}</View>
      <View style={styles.supportCard}><Text style={styles.supportText}>ไม่ว่าคำตอบจะเป็นแบบไหน คุณก็สมควรได้รับพื้นที่ที่ปลอดภัยและอ่อนโยนกับหัวใจตัวเอง</Text></View>
      <Pressable onPress={finish} style={styles.button}><Text style={styles.buttonText}>ดูข้อความสำหรับคุณ</Text></Pressable>
      <Text style={styles.privacy}>คำตอบจะถูกเก็บไว้ในเครื่องนี้เท่านั้น</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 20, backgroundColor: '#F9F1EE' }, back: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 }, backText: { color: colors.primary, fontSize: 15, fontWeight: '700' }, progress: { flexDirection: 'row', gap: 7, marginTop: 13 }, progressActive: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }, step: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 25 }, title: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '800', marginTop: 8 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }, options: { gap: 12, marginTop: 27 }, option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 17 }, selectedOption: { borderColor: '#C98193', backgroundColor: '#FFF2F5' }, emoji: { fontSize: 26, marginRight: 13 }, label: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' }, selectedText: { color: '#6A3F4B' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#C9BCC0' }, selectedRadio: { borderWidth: 5, borderColor: colors.primary }, supportCard: { backgroundColor: '#F0F3EA', borderRadius: 16, padding: 16, marginTop: 20 }, supportText: { color: '#667260', fontSize: 13, lineHeight: 20 }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 20 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, privacy: { color: '#9B8F92', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
