import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs tintColor="#A85E72">
      <NativeTabs.Trigger name="Home">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>วันนี้</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Journal">
        <Icon sf={{ default: 'square.and.pencil', selected: 'square.and.pencil.circle.fill' }} />
        <Label>เขียนบันทึก</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="History">
        <Icon sf={{ default: 'calendar', selected: 'calendar.circle.fill' }} />
        <Label>ย้อนหลัง</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Progress">
        <Icon sf={{ default: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis.circle.fill' }} />
        <Label>การเติบโต</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="Settings">
        <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        <Label>ตั้งค่า</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
