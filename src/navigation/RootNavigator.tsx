import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { HealingGoalScreen } from '../screens/HealingGoalScreen';
import { HealingFollowUpScreen } from '../screens/HealingFollowUpScreen';
import { HealingComfortScreen } from '../screens/HealingComfortScreen';
import { FeelingScreen } from '../screens/FeelingScreen';
import { FeelingReasonScreen } from '../screens/FeelingReasonScreen';
import { NoContactScreen } from '../screens/NoContactScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { UrgeSupportScreen } from '../screens/UrgeSupportScreen';
import { MainTabParamList, RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const tabIcons: Record<keyof MainTabParamList, string> = { Home: '🌱', Journal: '✍️', History: '🗓️', Progress: '📈', Settings: '⚙️' };

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#A85E72',
      tabBarInactiveTintColor: '#9C9295',
      tabBarActiveBackgroundColor: '#FFF1F5',
      tabBarStyle: { height: 58 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, borderTopColor: '#EEE3E5', backgroundColor: '#FFFFFF' },
      tabBarItemStyle: { borderRadius: 17, marginHorizontal: 4, overflow: 'hidden' },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      animation: 'fade',
      transitionSpec: { animation: 'timing', config: { duration: 180 } },
      tabBarIcon: ({ focused }) => <TabIcon icon={tabIcons[route.name]} focused={focused} />,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'วันนี้' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: 'เขียนบันทึก' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'ย้อนหลัง' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'การเติบโต' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'ตั้งค่า' }} />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) return progress.setValue(focused ? 1 : 0);
      Animated.spring(progress, { toValue: focused ? 1 : 0, damping: 18, stiffness: 220, mass: 0.7, useNativeDriver: true }).start();
    });
  }, [focused, progress]);

  return (
    <Animated.View style={[styles.tabIcon, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] }) }] }]}>
      <Text style={styles.tabEmoji}>{icon}</Text>
      <Animated.View style={[styles.activeDot, { opacity: progress, transform: [{ scale: progress }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabIcon: { width: 42, height: 29, alignItems: 'center', justifyContent: 'center' },
  tabEmoji: { fontSize: 20 },
  activeDot: { position: 'absolute', bottom: -1, width: 4, height: 4, borderRadius: 2, backgroundColor: '#A85E72' },
});

export function RootNavigator() {
  const { hasOnboarded } = useApp();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}>
      {hasOnboarded ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
          <Stack.Screen name="UrgeSupport" component={UrgeSupportScreen} options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        </>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="NoContactQuestion" component={NoContactScreen} />
          <Stack.Screen name="FeelingQuestion" component={FeelingScreen} />
          <Stack.Screen name="FeelingReasonQuestion" component={FeelingReasonScreen} />
          <Stack.Screen name="HealingGoalQuestion" component={HealingGoalScreen} />
          <Stack.Screen name="HealingFollowUp" component={HealingFollowUpScreen} />
          <Stack.Screen name="HealingComfort" component={HealingComfortScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
