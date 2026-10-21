import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const NOTIFICATION_IDS_KEY = '@keep_going/gentle_notification_ids';
const DAYS_TO_SCHEDULE = 30;

const gentleMessages = [
  'แวะกลับมาดูแลตัวเองสักครู่นะ',
  'วันนี้มีพื้นที่เล็ก ๆ ให้คุณเสมอ',
  'ค่อย ๆ ไปก็ได้ วันนี้คุณทำดีแล้ว',
  'ลองหยุดพักและฟังใจตัวเองสักครู่',
  'ไม่ต้องรีบเก่งขึ้น แค่กลับมาหาตัวเองก็พอ',
  'วันนี้อย่าลืมอ่อนโยนกับตัวเองนะ',
  'หนึ่งนาทีเล็ก ๆ ก็เป็นการดูแลตัวเองได้',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type NotificationScheduleResult = 'scheduled' | 'denied';

async function cancelGentleNotifications() {
  const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
  const identifiers: string[] = stored ? JSON.parse(stored) : [];
  await Promise.all(identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)));
  await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
}

function nextOccurrence(dayOffset: number, hour: number, minute: number) {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

export async function disableGentleNotifications() {
  await cancelGentleNotifications();
}

export async function scheduleGentleNotifications(hour: number, minute: number, askPermission = true): Promise<NotificationScheduleResult> {
  const currentPermission = await Notifications.getPermissionsAsync();
  const permission = currentPermission.granted || !askPermission
    ? currentPermission
    : await Notifications.requestPermissionsAsync();

  if (!permission.granted) return 'denied';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('gentle-check-in', {
      name: 'เตือนให้กลับมาดูแลตัวเอง',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      sound: 'default',
    });
  }

  await cancelGentleNotifications();
  const identifiers: string[] = [];
  for (let index = 0; index < DAYS_TO_SCHEDULE; index += 1) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Keep Going',
        body: gentleMessages[index % gentleMessages.length],
        sound: 'default',
        data: { screen: 'Home', kind: 'gentle-check-in' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextOccurrence(index, hour, minute),
        channelId: Platform.OS === 'android' ? 'gentle-check-in' : undefined,
      },
    });
    identifiers.push(identifier);
  }
  await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(identifiers));
  return 'scheduled';
}

export function parseReminderTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null;
}
