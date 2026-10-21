import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Button,
  DataTable,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  List,
  MD3LightTheme,
  Menu,
  PaperProvider,
  Portal,
  Switch,
  Text,
  Tooltip,
} from 'react-native-paper';
import { Screen } from '../components/Screen';
import { colors } from '../constants/theme';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondaryContainer: '#F3E4E9',
    surface: '#FFFDFC',
    surfaceVariant: '#F4ECEE',
  },
};

export function ComponentShowcaseScreen() {
  const { menu } = useLocalSearchParams<{ menu?: string }>();
  const [menuVisible, setMenuVisible] = useState(menu === '1');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [gentleMode, setGentleMode] = useState(true);
  const [drawerItem, setDrawerItem] = useState('today');

  useEffect(() => {
    if (menu === '1') setMenuVisible(true);
  }, [menu]);

  return (
    <PaperProvider theme={paperTheme}>
      <Screen animateOnFocus={false} contentStyle={styles.screen}>
        <View style={styles.topBar}>
          <IconButton icon="arrow-left" size={22} onPress={() => router.back()} accessibilityLabel="ย้อนกลับ" />
          <View style={styles.topCopy}><Text variant="titleLarge" style={styles.title}>พื้นที่ของฉัน</Text></View>
          <Tooltip title="หน้าถัดไป"><IconButton icon="arrow-right" size={22} onPress={() => router.push('/ComponentShowcaseMore')} /></Tooltip>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}><Text variant="titleMedium" style={styles.sectionTitle}>วันนี้อยากทำอะไร</Text><Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={<IconButton icon="dots-horizontal" onPress={() => setMenuVisible(true)} />}><Menu.Item leadingIcon="heart-outline" onPress={() => setMenuVisible(false)} title="บันทึกไว้" /><Menu.Item leadingIcon="share-variant-outline" onPress={() => setMenuVisible(false)} title="แชร์" /></Menu></View>
          <View style={styles.iconRow}><Tooltip title="ชอบ"><IconButton icon="heart-outline" mode="contained-tonal" onPress={() => {}} /></Tooltip><Tooltip title="เขียนบันทึก"><IconButton icon="pencil-outline" mode="contained-tonal" onPress={() => {}} /></Tooltip><Tooltip title="ตั้งเวลา"><IconButton icon="bell-outline" mode="contained-tonal" onPress={() => {}} /></Tooltip></View>
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>ดูแลใจอย่างสม่ำเสมอ</Text>
          <List.Item title="เตือนให้เช็กอิน" description="วันละครั้ง เวลา 20:00 น." left={(props) => <List.Icon {...props} icon="bell-outline" />} right={() => <Switch value={gentleMode} onValueChange={setGentleMode} />} />
          <Divider />
          <List.Item title="ข้อมูลอยู่ในเครื่อง" description="ไม่ส่งบันทึกส่วนตัวขึ้นเซิร์ฟเวอร์" left={(props) => <List.Icon {...props} icon="shield-lock-outline" />} />
        </View>

        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>เรื่องราวในสัปดาห์นี้</Text>
          <DataTable>
            <DataTable.Header><DataTable.Title>วัน</DataTable.Title><DataTable.Title>อารมณ์</DataTable.Title><DataTable.Title numeric>เช็กอิน</DataTable.Title></DataTable.Header>
            <DataTable.Row><DataTable.Cell>จันทร์</DataTable.Cell><DataTable.Cell>สงบ</DataTable.Cell><DataTable.Cell numeric>1</DataTable.Cell></DataTable.Row>
            <DataTable.Row><DataTable.Cell>อังคาร</DataTable.Cell><DataTable.Cell>คิดถึง</DataTable.Cell><DataTable.Cell numeric>1</DataTable.Cell></DataTable.Row>
            <DataTable.Row><DataTable.Cell>พุธ</DataTable.Cell><DataTable.Cell>ดีขึ้น</DataTable.Cell><DataTable.Cell numeric>1</DataTable.Cell></DataTable.Row>
          </DataTable>
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
          <Button mode="contained-tonal" onPress={() => setDialogVisible(true)} style={styles.dialogButton}>เปิดอ่านข้อความวันนี้</Button>
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
  topCopy: { flex: 1 },
  title: { color: colors.text, fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#EBDDE0' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { flex: 1, color: colors.text, fontWeight: '800' },
  body: { color: colors.muted, lineHeight: 21, marginTop: 6 },
  iconRow: { flexDirection: 'row', gap: 4, marginTop: 8 },
  dialogButton: { alignSelf: 'flex-start', marginTop: 14 },
  dialogTitle: { textAlign: 'center', color: colors.text },
});
