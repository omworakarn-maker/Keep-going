import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { MainTabParamList, RootStackParamList } from '../types';
import { daysSince, elapsedSince, formatThaiDate } from '../utils/date';

export function HomeScreen() {
  const { startDate, healingStartedAt, healingGoal, entries, selfReasons } = useApp();
  const navigation = useNavigation<CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>>();
  const [now, setNow] = useState(Date.now());
  const days = daysSince(startDate);
  const healingTime = elapsedSince(healingStartedAt, now);
  const latest = entries[0];
  const milestone = days >= 100 ? '100 วันแล้ว คุณเก่งมากจริง ๆ' : days >= 30 ? 'ครบ 30 วันแล้วนะ' : days >= 7 ? 'ครบหนึ่งสัปดาห์แล้ว' : 'ค่อย ๆ ไปทีละวันนะ';
  const reasonOfTheDay = selfReasons.length ? selfReasons[daySeed(new Date()) % selfReasons.length] : '';

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen animateOnFocus={false}>
      <Text style={styles.eyebrow}>KEEP GOING</Text>
      <Text style={styles.brand}>วันนี้คุณยังเลือกตัวเองอยู่นะ</Text>
      <Text style={styles.subtitle}>ไม่ต้องรีบดีขึ้น แค่ค่อย ๆ ไปก็พอ</Text>

      <View style={styles.hero}>
        <Text style={styles.caption}>เราไม่ได้คุยกันมา</Text>
        <View style={styles.dayRow}><Text style={styles.days}>{days}</Text><Text style={styles.dayUnit}>วัน</Text></View>
        <Text style={styles.milestone}>{milestone}</Text>
        <Text style={styles.date}>ตั้งแต่ {formatThaiDate(startDate)}</Text>
        <View style={styles.heroDivider} />
        <Text style={styles.timerEyebrow}>เวลาที่ฉันเลือกจะก้าวต่อไป</Text>
        <View style={styles.timerRow}>
          <TimerUnit value={healingTime.days} label="วัน" />
          <Text style={styles.timerColon}>:</Text>
          <TimerUnit value={healingTime.hours} label="ชม." />
          <Text style={styles.timerColon}>:</Text>
          <TimerUnit value={healingTime.minutes} label="นาที" />
          <Text style={styles.timerColon}>:</Text>
          <TimerUnit value={healingTime.seconds} label="วินาที" />
        </View>
      </View>

      <View style={styles.goalBlock}><View style={styles.goalDot} /><View><Text style={styles.goalLabel}>เป้าหมายของฉัน</Text><Text style={styles.goal}>{healingGoal}</Text></View></View>
      {reasonOfTheDay ? <View style={styles.reasonCard}><Text style={styles.reasonLabel}>เหตุผลที่ฉันเลือกตัวเองในวันนี้</Text><Text style={styles.reasonText}>“{reasonOfTheDay}”</Text></View> : null}
      <Pressable onPress={() => navigation.navigate('Journal')} style={styles.primaryButton}><Text style={styles.primaryText}>เช็กอินความรู้สึกวันนี้</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('UrgeSupport')} style={styles.urgeButton}><View><Text style={styles.urgeTitle}>ตอนนี้ฉันอยากทักเขา</Text><Text style={styles.urgeSubtitle}>พักใจตรงนี้ก่อนสักครู่</Text></View><Text style={styles.urgeArrow}>›</Text></Pressable>

      <View style={styles.sectionHeader}><Text style={styles.section}>บันทึกล่าสุด</Text><Text style={styles.sectionHint}>เรื่องเล็ก ๆ ของวันนี้</Text></View>
      {latest ? <View style={styles.entry}><Text style={styles.entryEmoji}>{latest.emoji}</Text><View style={styles.entryBody}><Text style={styles.entryMeta}>{latest.mood} · {formatThaiDate(latest.date)}</Text><Text style={styles.entryText}>{latest.note}</Text></View></View> : <View style={styles.empty}><Text style={styles.emptyText}>ยังไม่มีบันทึก ลองเริ่มจากหนึ่งประโยคก็พอ</Text></View>}
    </Screen>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return <View style={styles.timerUnit}><Text style={styles.timerValue}>{String(value).padStart(2, '0')}</Text><Text style={styles.timerLabel}>{label}</Text></View>;
}

function daySeed(date: Date) { return Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`); }

const styles = StyleSheet.create({
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 2.4, marginTop: 12 },
  brand: { maxWidth: 290, color: colors.text, fontSize: 28, lineHeight: 37, fontWeight: '800', marginTop: 9 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 6, marginBottom: 24 },
  hero: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 30, paddingHorizontal: 22, paddingTop: 27, paddingBottom: 22 },
  caption: { color: '#796C73', fontSize: 14 },
  dayRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 },
  days: { color: colors.primary, fontSize: 78, lineHeight: 86, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dayUnit: { color: colors.primary, fontSize: 16, fontWeight: '800', marginLeft: 8, marginBottom: 13 },
  milestone: { color: '#6C5660', fontSize: 13, fontWeight: '700', marginTop: 2 },
  date: { color: '#9A737C', fontSize: 11, marginTop: 7 },
  heroDivider: { width: '100%', height: 1, backgroundColor: '#E3C8CF', marginVertical: 19 },
  timerEyebrow: { color: '#8D727A', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  timerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 10 },
  timerUnit: { alignItems: 'center', minWidth: 45 },
  timerValue: { color: colors.text, fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerLabel: { color: colors.muted, fontSize: 9, marginTop: 2 },
  timerColon: { color: '#C59BA6', fontSize: 18, fontWeight: '800' },
  goalBlock: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 18 },
  goalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0A6B4', marginRight: 12 },
  goalLabel: { color: '#9A7E86', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  goal: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 3 },
  reasonCard: { backgroundColor: '#FFF8F5', borderRadius: 18, borderWidth: 1, borderColor: '#EADADD', padding: 16, marginBottom: 14 },
  reasonLabel: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  reasonText: { color: colors.text, fontSize: 15, lineHeight: 23, fontWeight: '700', marginTop: 7 },
  primaryButton: { minHeight: 54, backgroundColor: colors.primary, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  urgeButton: { minHeight: 64, paddingHorizontal: 7, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  urgeTitle: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  urgeSubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  urgeArrow: { color: colors.primary, fontSize: 28, lineHeight: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 24, marginBottom: 11 },
  section: { color: colors.text, fontSize: 18, fontWeight: '800' },
  sectionHint: { color: colors.muted, fontSize: 10 },
  entry: { flexDirection: 'row', backgroundColor: '#FFF0E8', borderRadius: 20, padding: 17 },
  entryEmoji: { fontSize: 27, marginRight: 12 },
  entryBody: { flex: 1 },
  entryMeta: { color: '#98717C', fontSize: 12, marginBottom: 5 },
  entryText: { color: colors.text, lineHeight: 22 },
  empty: { backgroundColor: '#F7F0EB', borderRadius: 20, padding: 20 },
  emptyText: { color: colors.muted, lineHeight: 21 },
});
