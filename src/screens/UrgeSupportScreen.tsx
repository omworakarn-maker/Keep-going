import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { RootStackParamList } from '../types';

const TOTAL_SECONDS = 60;

export function UrgeSupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { healingGoal, healingAnswer, addUrgeEntry } = useApp();
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);
  const [message, setMessage] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const breath = useRef(new Animated.Value(0)).current;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const player = useAudioPlayer(audioUri);
  const playerStatus = useAudioPlayerStatus(player);
  const stopping = useRef(false);
  const saved = useRef(false);
  const recordedDuration = useRef(0);
  const slide = useRef(new Animated.Value(0)).current;
  const pageOpacity = useRef(new Animated.Value(1)).current;
  const transitioning = useRef(false);

  useEffect(() => {
    if (step !== 0) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0, duration: 4000, useNativeDriver: true }),
    ]));
    loop.start();
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) { clearInterval(timer); return 0; }
      return value - 1;
    }), 1000);
    return () => { loop.stop(); clearInterval(timer); };
  }, [breath, step]);

  const stopRecording = async () => {
    if (stopping.current || !recorderState.isRecording) return audioUri;
    stopping.current = true;
    try {
      recordedDuration.current = Math.min(60, Math.ceil(recorderState.durationMillis / 1000));
      await recorder.stop();
      setAudioUri(recorder.uri);
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      return recorder.uri;
    } finally {
      stopping.current = false;
    }
  };

  useEffect(() => {
    if (recorderState.isRecording && recorderState.durationMillis >= 60000) stopRecording();
  }, [recorderState.durationMillis, recorderState.isRecording]);

  const startRecording = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('ต้องอนุญาตใช้ไมโครโฟน', 'เปิดสิทธิ์ไมโครโฟนในการตั้งค่า แล้วลองอีกครั้งนะ');
      return;
    }
    if (playerStatus.playing) player.pause();
    setAudioUri(null);
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const togglePlayback = () => {
    if (playerStatus.playing) return player.pause();
    if (playerStatus.didJustFinish || playerStatus.currentTime >= playerStatus.duration) player.seekTo(0);
    player.play();
  };

  const transitionTo = (target: number, direction: 1 | -1) => {
    if (transitioning.current || target < 0 || target > 2) return;
    transitioning.current = true;
    const width = Dimensions.get('window').width;
    Animated.parallel([
      Animated.timing(slide, { toValue: -direction * width, duration: 190, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(pageOpacity, { toValue: 0.35, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(target);
      slide.setValue(direction * width);
      pageOpacity.setValue(0.35);
      requestAnimationFrame(() => Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pageOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start(() => { transitioning.current = false; }));
    });
  };

  const next = async () => {
    const finalAudioUri = recorderState.isRecording ? await stopRecording() : audioUri;
    if (step === 1 && !saved.current && (message.trim() || finalAudioUri)) {
      saved.current = true;
      try {
        await addUrgeEntry(message, finalAudioUri, recordedDuration.current);
      } catch {
        saved.current = false;
        Alert.alert('ยังบันทึกไม่ได้', 'ลองกดอีกครั้งนะ');
        return;
      }
    }
    transitionTo(Math.min(step + 1, 2), 1);
  };
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1.18] });
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });

  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}>
      <Pressable style={styles.headerSide} onPress={() => step === 0 ? navigation.goBack() : transitionTo(step - 1, -1)} hitSlop={12}><Text style={styles.back}>‹ ย้อนกลับ</Text></Pressable>
      <View style={styles.steps}>{[0, 1, 2].map((item) => <View key={item} style={[styles.stepDot, item <= step && styles.stepDotActive]} />)}</View>
      <Pressable style={[styles.headerSide, styles.headerSideRight]} onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.close}>ปิด</Text></Pressable>
    </View>
    <Animated.View style={[styles.page, { opacity: pageOpacity, transform: [{ translateX: slide }] }]}>
    {step === 0 && <View style={styles.content}>
      <Text style={styles.eyebrow}>พักก่อนสักครู่นะ</Text><Text style={styles.title}>คุณยังไม่ต้องตัดสินใจตอนนี้</Text>
      <Text style={styles.body}>วางโทรศัพท์ไว้ใกล้ ๆ แล้วหายใจไปพร้อมกัน ให้ความรู้สึกนี้ค่อย ๆ เบาลง</Text>
      <View style={styles.breathArea}><Animated.View style={[styles.breathOuter, { opacity, transform: [{ scale }] }]} /><View style={styles.breathInner}><Text style={styles.breathText}>หายใจช้า ๆ</Text><Text style={styles.countdown}>{seconds}</Text><Text style={styles.seconds}>วินาที</Text></View></View>
      <Pressable onPress={next} style={styles.primary}><Text style={styles.primaryText}>{seconds === 0 ? 'ฉันพร้อมไปต่อ' : 'ข้ามไปเขียนความรู้สึก'}</Text></Pressable>
    </View>}
    {step === 1 && <View style={styles.content}>
      <Text style={styles.eyebrow}>พื้นที่ที่ปลอดภัย</Text><Text style={styles.title}>ถ้าได้ส่งหาเขา คุณอยากพูดว่าอะไร</Text>
      <Text style={styles.body}>เขียนออกมาได้ทั้งหมด ข้อความนี้จะไม่ถูกส่งไปหาใคร</Text>
      <View style={styles.noteCard}><TextInput value={message} onChangeText={setMessage} placeholder="พิมพ์สิ่งที่อยู่ในใจตรงนี้..." placeholderTextColor="#B1A5A9" multiline style={styles.input} textAlignVertical="top" /></View>
      <View style={styles.voiceCard}>
        <View><Text style={styles.voiceTitle}>{recorderState.isRecording ? 'กำลังฟังคุณอยู่…' : audioUri ? 'บันทึกเสียงของคุณ' : 'อยากพูดแทนการพิมพ์ไหม'}</Text><Text style={styles.voiceHint}>{recorderState.isRecording ? `เหลือ ${Math.max(0, 60 - Math.floor(recorderState.durationMillis / 1000))} วินาที` : audioUri ? 'เสียงนี้จะไม่ถูกส่งไปหาใคร' : 'อัดเสียงได้สูงสุด 1 นาที'}</Text></View>
        {recorderState.isRecording
          ? <Pressable onPress={stopRecording} style={[styles.micButton, styles.stopButton]}><Text style={styles.micIcon}>■</Text></Pressable>
          : audioUri
            ? <View style={styles.voiceActions}><Pressable onPress={togglePlayback} style={styles.playButton}><Text style={styles.playIcon}>{playerStatus.playing ? '❚❚' : '▶'}</Text></Pressable><Pressable onPress={startRecording} style={styles.retryButton}><Text style={styles.retryText}>อัดใหม่</Text></Pressable></View>
            : <Pressable onPress={startRecording} style={styles.micButton}><Text style={styles.micIcon}>🎙️</Text></Pressable>}
      </View>
      <Pressable onPress={next} style={styles.primary}><Text style={styles.primaryText}>เก็บข้อความไว้ตรงนี้ แล้วไปต่อ</Text></Pressable>
    </View>}
    {step === 2 && <View style={styles.content}>
      <Text style={styles.finalEmoji}>🌱</Text><Text style={[styles.title, styles.center]}>วันนี้คุณเลือกดูแลหัวใจตัวเองแล้ว</Text>
      <Text style={[styles.body, styles.center]}>การคิดถึงเขาไม่ได้แปลว่าคุณต้องกลับไปหาเขา ความรู้สึกเกิดขึ้นได้ และมันจะค่อย ๆ ผ่านไป</Text>
      <View style={styles.reminder}><Text style={styles.reminderLabel}>สิ่งที่คุณกำลังทำเพื่อตัวเอง</Text><Text style={styles.reminderText}>{healingGoal || 'กลับมาดูแลหัวใจตัวเอง'}</Text>{healingAnswer ? <Text style={styles.answer}>“{healingAnswer}”</Text> : null}</View>
      <Pressable onPress={() => navigation.goBack()} style={styles.primary}><Text style={styles.primaryText}>กลับไปใช้วันนี้ของฉันต่อ</Text></Pressable>
    </View>}
    </Animated.View>
  </KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF9F5', overflow: 'hidden' }, flex: { flex: 1 }, page: { flex: 1 }, header: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerSide: { width: 82, height: 44, justifyContent: 'center' }, headerSideRight: { alignItems: 'flex-end' }, back: { color: colors.primary, fontSize: 14, lineHeight: 20, fontWeight: '700' }, close: { color: colors.muted, fontSize: 14, lineHeight: 20, fontWeight: '700' }, steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, stepDot: { width: 18, height: 4, borderRadius: 2, backgroundColor: '#E9DDE0' }, stepDotActive: { backgroundColor: colors.primary },
  content: { flex: 1, paddingHorizontal: 26, paddingTop: 38, paddingBottom: 28 }, eyebrow: { color: colors.primary, fontSize: 13, fontWeight: '800', marginBottom: 12 }, title: { color: colors.text, fontSize: 29, lineHeight: 38, fontWeight: '800' }, body: { color: colors.muted, fontSize: 16, lineHeight: 25, marginTop: 14 },
  breathArea: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' }, breathOuter: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#EACBD3' }, breathInner: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#A85E72', shadowOpacity: 0.1, shadowRadius: 18 }, breathText: { color: colors.primary, fontSize: 13, fontWeight: '800' }, countdown: { color: colors.text, fontSize: 40, lineHeight: 46, fontWeight: '800', fontVariant: ['tabular-nums'] }, seconds: { color: colors.muted, fontSize: 11 },
  primary: { backgroundColor: colors.primary, minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 20 }, primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800', textAlign: 'center' }, noteCard: { flex: 1, minHeight: 250, backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: '#E9DED8', borderRadius: 20, padding: 18, marginTop: 24 }, input: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 27, padding: 0 },
  voiceCard: { minHeight: 72, borderRadius: 18, backgroundColor: '#F5E8EC', marginTop: 12, padding: 14, paddingLeft: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, voiceTitle: { color: colors.text, fontSize: 14, fontWeight: '800' }, voiceHint: { color: colors.muted, fontSize: 11, marginTop: 4 }, micButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, stopButton: { backgroundColor: '#C76D78' }, micIcon: { color: '#FFF', fontSize: 18, fontWeight: '800' }, voiceActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, playButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, playIcon: { color: '#FFF', fontSize: 15, fontWeight: '800' }, retryButton: { paddingHorizontal: 8, paddingVertical: 10 }, retryText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  finalEmoji: { fontSize: 52, textAlign: 'center', marginTop: 15, marginBottom: 22 }, center: { textAlign: 'center' }, reminder: { backgroundColor: '#F5E8EC', borderRadius: 22, padding: 22, marginTop: 32 }, reminderLabel: { color: '#98717C', fontSize: 12, fontWeight: '800' }, reminderText: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '800', marginTop: 7 }, answer: { color: '#796C73', fontSize: 14, lineHeight: 22, marginTop: 12 },
});
