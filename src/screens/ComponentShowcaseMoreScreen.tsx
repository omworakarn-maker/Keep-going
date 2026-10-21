import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Dialog, Drawer, IconButton, MD3LightTheme, PaperProvider, Portal, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';

const paperTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: colors.primary, secondaryContainer: '#F3E4E9', surface: '#FFFDFC', surfaceVariant: '#F4ECEE' } };

export function ComponentShowcaseMoreScreen() {
  const { dialog } = useLocalSearchParams<{ dialog?: string }>();
  const [dialogVisible, setDialogVisible] = useState(dialog === '1');
  const [drawerItem, setDrawerItem] = useState('today');

  useEffect(() => {
    if (dialog === '1') setDialogVisible(true);
  }, [dialog]);

  return (
    <PaperProvider theme={paperTheme}>
      <Screen animateOnFocus={false} contentStyle={styles.screen}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" size={22} onPress={() => router.back()} accessibilityLabel="ย้อนกลับ" />
          <Text variant="titleLarge" style={styles.title}>พื้นที่ของฉัน</Text>
        </View>
        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>ทางลัดของฉัน</Text>
          <Drawer.Section showDivider={false}>
            <Drawer.Item label="วันนี้" icon="sprout" active={drawerItem === 'today'} onPress={() => setDrawerItem('today')} />
            <Drawer.Item label="บันทึกของฉัน" icon="notebook-outline" active={drawerItem === 'journal'} onPress={() => setDrawerItem('journal')} />
            <Drawer.Item label="การเติบโต" icon="chart-line" active={drawerItem === 'progress'} onPress={() => setDrawerItem('progress')} />
          </Drawer.Section>
        </View>
        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>ข้อความถึงตัวเอง</Text>
          <Text variant="bodyMedium" style={styles.message}>มีบางวันที่เราไปได้ช้าลง แต่นั่นไม่ได้แปลว่าเราถอยหลัง</Text>
          <Button mode="contained-tonal" onPress={() => setDialogVisible(true)} style={styles.button}>เปิดอ่านข้อความวันนี้</Button>
        </View>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Icon icon="heart-outline" />
            <Dialog.Title style={styles.dialogTitle}>พักตรงนี้ก่อนได้นะ</Dialog.Title>
            <Dialog.Content><Text variant="bodyMedium">วันนี้ยังไม่ต้องเก่งทุกอย่างก็ได้ แค่ไม่ทิ้งตัวเองก็พอแล้ว</Text></Dialog.Content>
            <Dialog.Actions><Button onPress={() => setDialogVisible(false)}>ปิด</Button><Button onPress={() => setDialogVisible(false)}>เข้าใจแล้ว</Button></Dialog.Actions>
          </Dialog>
        </Portal>
      </Screen>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 8, gap: 14, backgroundColor: '#FFF9F6' },
  topBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -10, marginBottom: 5 },
  title: { flex: 1, color: colors.text, fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#EBDDE0' },
  sectionTitle: { color: colors.text, fontWeight: '800' },
  message: { color: colors.muted, lineHeight: 23, marginTop: 12 },
  button: { alignSelf: 'flex-start', marginTop: 16 },
  dialogTitle: { textAlign: 'center', color: colors.text },
});
