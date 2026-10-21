import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Button, DataTable, Dialog, Divider, Drawer, IconButton, List, Menu, Portal, Text, Tooltip } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/theme';

/** Components from the showcase, connected to account data and real routes. */
export function MySpaceTools() {
  const { entries, diaryEntries, urgeEntries, selfReasons } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const closeMenu = () => setMenuVisible(false);
  return <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 16, marginTop: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text variant="titleMedium" style={{ flex: 1 }}>พื้นที่ของฉัน</Text>
      <Menu visible={menuVisible} onDismiss={closeMenu} anchor={<Tooltip title="ทางลัดเพิ่มเติม"><IconButton icon="dots-horizontal" accessibilityLabel="ทางลัดเพิ่มเติม" onPress={() => setMenuVisible(true)} /></Tooltip>}>
        <Menu.Item leadingIcon="pencil-outline" title="เขียนบันทึก" onPress={() => { closeMenu(); router.push('/(tabs)/Journal'); }} />
        <Menu.Item leadingIcon="chart-line" title="ดูการเติบโต" onPress={() => { closeMenu(); router.push('/(tabs)/Progress'); }} />
      </Menu>
    </View>
    <List.Item title="เหตุผลที่ฉันเลือกตัวเอง" description={`${selfReasons.length} เหตุผลที่บันทึกไว้`} left={props => <List.Icon {...props} icon="heart-outline" />} onPress={() => setDialogVisible(true)} />
    <Divider />
    <DataTable>
      <DataTable.Header><DataTable.Title>บันทึกของบัญชีนี้</DataTable.Title><DataTable.Title numeric>จำนวน</DataTable.Title></DataTable.Header>
      <DataTable.Row onPress={() => router.push('/(tabs)/History')}><DataTable.Cell>เช็กอินรายวัน</DataTable.Cell><DataTable.Cell numeric>{entries.length}</DataTable.Cell></DataTable.Row>
      <DataTable.Row onPress={() => router.push('/(tabs)/History')}><DataTable.Cell>ไดอารี</DataTable.Cell><DataTable.Cell numeric>{diaryEntries.length}</DataTable.Cell></DataTable.Row>
      <DataTable.Row onPress={() => router.push('/(tabs)/History')}><DataTable.Cell>ข้อความและจดหมายที่ไม่ได้ส่ง</DataTable.Cell><DataTable.Cell numeric>{urgeEntries.length}</DataTable.Cell></DataTable.Row>
    </DataTable>
    <Drawer.Section title="ทางลัดของฉัน" showDivider={false}>
      <Drawer.Item label="วันนี้" icon="sprout" onPress={() => router.push('/(tabs)/Home')} />
      <Drawer.Item label="บันทึกของฉัน" icon="notebook-outline" onPress={() => router.push('/(tabs)/History')} />
      <Drawer.Item label="การเติบโต" icon="chart-line" onPress={() => router.push('/(tabs)/Progress')} />
    </Drawer.Section>
    <Button mode="contained-tonal" icon="heart-outline" onPress={() => setDialogVisible(true)}>อ่านเหตุผลที่ฉันเลือกตัวเอง</Button>
    <Portal><Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
      <Dialog.Icon icon="heart-outline" /><Dialog.Title>เหตุผลที่ฉันเลือกตัวเอง</Dialog.Title>
      <Dialog.ScrollArea><ScrollView><List.Section>{selfReasons.length ? selfReasons.map((reason, index) => <List.Item key={`${index}-${reason}`} title={reason} titleNumberOfLines={6} />) : <Text style={{ padding: 16 }}>เพิ่มเหตุผลในส่วนพื้นที่เตือนใจ เพื่อกลับมาอ่านเมื่อคุณต้องการ</Text>}</List.Section></ScrollView></Dialog.ScrollArea>
      <Dialog.Actions><Button onPress={() => setDialogVisible(false)}>ปิด</Button></Dialog.Actions>
    </Dialog></Portal>
  </View>;
}
