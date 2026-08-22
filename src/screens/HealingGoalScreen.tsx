import { useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors, healingGoals } from '../constants/theme';
import { RootStackParamList } from '../types';

const goalDetails: Record<string, { emoji: string; detail: string }> = {
  'กลับมารักตัวเอง': { emoji: '💗', detail: 'ดูแลและให้คุณค่ากับตัวเองอีกครั้ง' },
  'หยุดวนคิดถึงเขา': { emoji: '🕊️', detail: 'ค่อย ๆ ปล่อยความคิดที่ดึงเรากลับไป' },
  'รอเขากลับมา': { emoji: '⏳', detail: 'ดูแลหัวใจตัวเองให้ดีในระหว่างที่ยังรอ' },
  'นอนให้ดีขึ้น': { emoji: '🌙', detail: 'พักใจและร่างกายให้เพียงพอ' },
  'เริ่มต้นใหม่': { emoji: '✨', detail: 'เปิดพื้นที่ให้บทใหม่ของชีวิต' },
};

export function HealingGoalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HealingGoalQuestion'>>();
  const [goal, setGoal] = useState(healingGoals[0]);

  return (
    <Screen contentStyle={styles.screen} resetScrollOnFocus backgroundColor="#F9F1EE">
      <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹  ย้อนกลับ</Text></Pressable>
      <View style={styles.progress}><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressActive} /><View style={styles.progressIdle} /></View>
      <Text style={styles.step}>คำถาม 4 จาก 5</Text>
      <Text style={styles.title}>ตอนนี้อยากทำอะไรให้ตัวเองที่สุด?</Text>
      <Text style={styles.hint}>เลือกสิ่งที่ใจต้องการที่สุดในตอนนี้ เปลี่ยนภายหลังได้เสมอ</Text>
      <View style={styles.options}>{healingGoals.map((item) => {
        const info = goalDetails[item];
        return (
          <Pressable key={item} onPress={() => setGoal(item)} style={[styles.option, goal === item && styles.selectedOption]}>
            <Text style={styles.emoji}>{info.emoji}</Text><View style={styles.body}><Text style={[styles.label, goal === item && styles.selectedText]}>{item}</Text><Text style={styles.detail}>{info.detail}</Text></View><View style={[styles.radio, goal === item && styles.selectedRadio]} />
          </Pressable>
        );
      })}</View>
      <Pressable onPress={() => navigation.navigate('HealingFollowUp', { days: route.params.days, feeling: route.params.feeling, feelingReason: route.params.feelingReason, feelingNote: route.params.feelingNote, goal })} style={styles.button}><Text style={styles.buttonText}>ถัดไป</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 20, backgroundColor: '#F9F1EE' }, back: { alignSelf: 'flex-start', paddingVertical: 10, paddingRight: 20 }, backText: { color: colors.primary, fontSize: 15, fontWeight: '700' }, progress: { flexDirection: 'row', gap: 7, marginTop: 13 }, progressActive: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.primary }, progressIdle: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E8DADD' }, step: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 25 }, title: { color: colors.text, fontSize: 27, lineHeight: 36, fontWeight: '800', marginTop: 8 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 }, options: { gap: 11, marginTop: 25 }, option: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 15 }, selectedOption: { borderColor: '#C98193', backgroundColor: '#FFF2F5' }, emoji: { fontSize: 25, marginRight: 12 }, body: { flex: 1 }, label: { color: colors.text, fontSize: 16, fontWeight: '700' }, detail: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 }, selectedText: { color: '#6A3F4B' }, radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 2, borderColor: '#C9BCC0' }, selectedRadio: { borderWidth: 5, borderColor: colors.primary }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 28 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
