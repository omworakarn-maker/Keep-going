import { useEffect, useMemo, useState } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types';

type Comfort = { emoji: string; opening: string; message: string; reminder: string };

const comforts: Record<string, Comfort> = {
  'กลับมารักตัวเอง': {
    emoji: '💗',
    opening: 'ไม่เป็นไรนะ\nถ้าใจยังเผลอกลับไปมอง',
    message: 'การที่คุณยังสนใจเขา\nไม่ได้แปลว่าคุณรักตัวเองไม่เป็น',
    reminder: 'จากวันนี้...\nเราจะค่อย ๆ หันความอ่อนโยน\nกลับมาให้ตัวเองทีละนิด',
  },
  'หยุดวนคิดถึงเขา': {
    emoji: '🕊️',
    opening: 'ความคิดถึง\nไม่ได้ทำให้คุณอ่อนแอ',
    message: 'ใจมักกลับไปหา\nสิ่งที่เคยสำคัญเสมอ',
    reminder: 'ไม่ต้องบังคับให้ตัวเองลืม\nแค่ค่อย ๆ กลับมาอยู่กับวันนี้ก็พอ',
  },
  'รอเขากลับมา': {
    emoji: '⏳',
    opening: 'คุณรอเขาได้\nโดยไม่ต้องหยุดใช้ชีวิต',
    message: 'ความหวังของคุณไม่ใช่เรื่องผิด\nและหัวใจของคุณก็สำคัญเหมือนกัน',
    reminder: 'ระหว่างที่ยังรอ...\nอย่าลืมสร้างวันที่มีความสุข\nให้ตัวคุณเองด้วยนะ',
  },
  'นอนให้ดีขึ้น': {
    emoji: '🌙',
    opening: 'คืนนี้คุณไม่ต้อง\nแก้ทุกเรื่องให้เสร็จ',
    message: 'บางความคิดหนักเกินกว่า\nจะจัดการได้ในคืนเดียว',
    reminder: 'วางมันไว้ตรงนี้ก่อนได้\nการพักผ่อนไม่ใช่การหนี',
  },
  'เริ่มต้นใหม่': {
    emoji: '✨',
    opening: 'คุณไม่จำเป็นต้องพร้อม\nทั้งหมดในวันนี้',
    message: 'การเริ่มต้นใหม่\nอาจเป็นเพียงการเลือกตัวเองอีกครั้ง',
    reminder: 'ก้าวเล็กที่สุดของคุณ\nก็ยังเป็นการก้าวไปข้างหน้า',
  },
};

const backgrounds = ['#F5E6EA', '#EEE8F4', '#E8F0EA'];

export function HealingComfortScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'HealingComfort'>>();
  const { finishOnboarding } = useApp();
  const comfort = comforts[route.params.goal];
  const slides = useMemo(() => [comfort.opening, comfort.message, comfort.reminder], [comfort]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [visibleText, setVisibleText] = useState('');
  const currentText = slides[slideIndex];
  const isTyped = visibleText.length === currentText.length;
  const isLast = slideIndex === slides.length - 1;

  useEffect(() => {
    setVisibleText('');
    let index = 0;
    const typing = setInterval(() => {
      index += 1;
      setVisibleText(currentText.slice(0, index));
      if (index >= currentText.length) clearInterval(typing);
    }, 38);
    return () => clearInterval(typing);
  }, [currentText]);

  const advance = () => {
    if (!isTyped) return setVisibleText(currentText);
    if (!isLast) setSlideIndex((current) => current + 1);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: backgrounds[slideIndex] }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={styles.progress}>{slides.map((_, index) => <View key={index} style={[styles.progressTrack, index <= slideIndex && styles.progressActive]} />)}</View>
        <View style={styles.backPlaceholder} />
      </View>

      <Pressable onPress={advance} style={styles.stage}>
        <Text style={styles.emoji}>{comfort.emoji}</Text>
        <Text style={styles.text}>{visibleText}<Text style={styles.cursor}>{isTyped ? '' : '|'}</Text></Text>
        {slideIndex === 1 && isTyped ? <Text style={styles.answer}>คุณบอกเราว่า “{route.params.answer}”</Text> : null}
      </Pressable>

      <View style={styles.footer}>
        {isLast && isTyped ? (
          <Pressable onPress={() => finishOnboarding(route.params.days, route.params.feeling, route.params.feelingReason, route.params.feelingNote, route.params.goal, route.params.answer)} style={styles.button}>
            <Text style={styles.buttonText}>ไปต่อกับ Keep Going</Text>
          </Pressable>
        ) : (
          <Pressable onPress={advance} style={styles.tapArea}><Text style={styles.tapText}>{isTyped ? 'แตะเพื่อไปต่อ' : 'แตะเพื่อแสดงข้อความทันที'}</Text></Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8 }, back: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }, backText: { color: colors.text, fontSize: 34, lineHeight: 35 }, backPlaceholder: { width: 38 }, progress: { flex: 1, flexDirection: 'row', gap: 6 }, progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(68,59,71,0.14)' }, progressActive: { backgroundColor: colors.primary }, stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }, emoji: { fontSize: 62, marginBottom: 30 }, text: { minHeight: 120, color: colors.text, fontSize: 29, lineHeight: 42, fontWeight: '800', textAlign: 'center' }, cursor: { color: colors.primary }, answer: { color: '#7E6E75', fontSize: 14, textAlign: 'center', marginTop: 25 }, footer: { minHeight: 110, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 14 }, tapArea: { alignItems: 'center', padding: 18 }, tapText: { color: '#8D7D83', fontSize: 13, fontWeight: '700' }, button: { backgroundColor: colors.primary, borderRadius: 17, alignItems: 'center', paddingVertical: 17 }, buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
