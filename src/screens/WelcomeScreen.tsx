import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';
import { RootStackParamList } from '../types';

export function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen contentStyle={styles.screen} backgroundColor="#F9F1EE">
      <View style={styles.content}>
        <Text style={styles.eyebrow}>KEEP GOING · NO CONTACT</Text>
        <Text style={styles.emoji}>🌱</Text>
        <Text style={styles.title}>เราเริ่มฮีลใจไปด้วยกันนะ</Text>
        <Text style={styles.lead}>พื้นที่เล็ก ๆ ที่จะช่วยให้คุณเห็นว่าตัวเองเดินมาไกลแค่ไหนแล้ว</Text>
        <View style={styles.note}><Text style={styles.noteTitle}>ก่อนเริ่ม มีคำถามสั้น ๆ 5 ข้อ</Text><Text style={styles.noteText}>ไม่มีคำตอบที่ถูกหรือผิด ตอบเท่าที่สบายใจได้เลย</Text></View>
      </View>
      <Pressable onPress={() => navigation.navigate('NoContactQuestion')} style={styles.button}><Text style={styles.buttonText}>เริ่มกันเลย</Text></Pressable>
      <Text style={styles.privacy}>คำตอบจะถูกเก็บไว้ในเครื่องนี้เท่านั้น</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', paddingTop: 58, backgroundColor: '#F9F1EE' }, content: { alignItems: 'center' }, eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, emoji: { fontSize: 64, marginTop: 36 }, title: { color: colors.text, fontSize: 30, lineHeight: 39, fontWeight: '800', textAlign: 'center', marginTop: 18 }, lead: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12 }, note: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginTop: 38 }, noteTitle: { color: colors.text, fontSize: 16, fontWeight: '800' }, noteText: { color: colors.muted, lineHeight: 21, marginTop: 6 }, button: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 36 }, buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' }, privacy: { color: '#9B8F92', fontSize: 12, textAlign: 'center', marginTop: 12 },
});
