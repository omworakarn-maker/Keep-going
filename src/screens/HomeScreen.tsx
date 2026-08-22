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
  const { startDate, healingStartedAt, healingGoal, entries } = useApp();
  const navigation = useNavigation<CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>>();
  const [now, setNow] = useState(Date.now());
  const days = daysSince(startDate);
  const healingTime = elapsedSince(healingStartedAt, now);
  const latest = entries[0];
  const milestone = days >= 100 ? '100 วันแล้ว คุณเก่งมากจริง ๆ' : days >= 30 ? 'ครบ 30 วันแล้วนะ' : days >= 7 ? 'ครบหนึ่งสัปดาห์แล้ว' : 'ค่อย ๆ ไปทีละวันนะ';

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen>
      <Text style={styles.brand}>Keep Going</Text>
      <Text style={styles.subtitle}>พื้นที่เล็ก ๆ สำหรับใจของคุณ</Text>
      <View style={styles.healingTimer}>
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
        <Text style={styles.timerMessage}>ทุกวินาทีคืออีกหนึ่งก้าวของคุณ</Text>
      </View>
      <View style={styles.hero}>
        <Text style={styles.caption}>เราไม่ได้คุยกันมา</Text>
        <Text style={styles.days}>{days}</Text>
        <Text style={styles.caption}>วัน</Text>
        <Text style={styles.milestone}>{milestone}</Text>
        <Text style={styles.date}>ตั้งแต่ {formatThaiDate(startDate)}</Text>
      </View>
      <View style={styles.goalCard}><Text style={styles.goalLabel}>เป้าหมายของฉัน</Text><Text style={styles.goal}>{healingGoal}</Text></View>
      <Pressable onPress={() => navigation.navigate('UrgeSupport')} style={styles.urgeButton}><View><Text style={styles.urgeTitle}>ตอนนี้ฉันอยากทักเขา</Text><Text style={styles.urgeSubtitle}>พักใจตรงนี้ก่อนสักครู่</Text></View><Text style={styles.urgeArrow}>›</Text></Pressable>
      <Pressable onPress={() => navigation.navigate('Journal')} style={styles.primaryButton}><Text style={styles.primaryText}>เช็กอินความรู้สึกวันนี้</Text></Pressable>
      <Text style={styles.section}>บันทึกล่าสุด</Text>
      {latest ? <View style={styles.entry}><Text style={styles.entryEmoji}>{latest.emoji}</Text><View style={styles.entryBody}><Text style={styles.entryMeta}>{latest.mood} · {formatThaiDate(latest.date)}</Text><Text style={styles.entryText}>{latest.note}</Text></View></View> : <View style={styles.empty}><Text style={styles.emptyText}>ยังไม่มีบันทึก ลองเริ่มจากหนึ่งประโยคก็พอ</Text></View>}
    </Screen>
  );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
  return <View style={styles.timerUnit}><Text style={styles.timerValue}>{String(value).padStart(2, '0')}</Text><Text style={styles.timerLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  urgeButton: { minHeight: 68, borderRadius: 18, borderWidth: 1, borderColor: '#DDBEC6', backgroundColor: '#FFF8F8', paddingHorizontal: 17, paddingVertical: 13, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, urgeTitle: { color: colors.primary, fontSize: 16, fontWeight: '800' }, urgeSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 }, urgeArrow: { color: colors.primary, fontSize: 30, lineHeight: 32 },
  brand: { fontSize: 30, fontWeight: '800', color: colors.text, marginTop: 12 }, subtitle: { color: colors.muted, marginTop: 4, marginBottom: 24 }, hero: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: 28, paddingVertical: 28 }, caption: { color: '#796C73', fontSize: 16 }, days: { color: colors.primary, fontSize: 76, lineHeight: 84, fontWeight: '800' }, milestone: { color: '#6C5660', marginTop: 10 }, date: { color: colors.primary, fontSize: 12, marginTop: 10 }, goalCard: { backgroundColor: '#FFF0E8', borderRadius: 18, padding: 17, marginTop: 16 }, goalLabel: { color: '#9A737C', fontSize: 12, fontWeight: '700' }, goal: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 }, healingTimer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border }, timerEyebrow: { color: colors.primary, fontSize: 13, fontWeight: '800' }, timerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 15 }, timerUnit: { alignItems: 'center', minWidth: 48 }, timerValue: { color: colors.text, fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] }, timerLabel: { color: colors.muted, fontSize: 10, marginTop: 3 }, timerColon: { color: '#C59BA6', fontSize: 22, fontWeight: '800', marginHorizontal: 1 }, timerMessage: { color: colors.muted, fontSize: 12, marginTop: 14 }, primaryButton: { backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center', padding: 15, marginTop: 16 }, primaryText: { color: '#FFF', fontWeight: '800' }, section: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 12 }, entry: { flexDirection: 'row', backgroundColor: '#FFF0E8', borderRadius: 18, padding: 16 }, entryEmoji: { fontSize: 27, marginRight: 12 }, entryBody: { flex: 1 }, entryMeta: { color: '#98717C', fontSize: 13, marginBottom: 5 }, entryText: { color: colors.text, lineHeight: 22 }, empty: { backgroundColor: '#F7F0EB', borderRadius: 18, padding: 20 }, emptyText: { color: colors.muted },
});
