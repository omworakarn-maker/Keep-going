import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DailyWelcome } from '../components/DailyWelcome';
import { AppProvider, useApp } from '../context/AppContext';

function NavigationGate() {
  const { hasOnboarded, isLoaded } = useApp();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded) return;
    const inTabs = segments[0] === '(tabs)';
    if (hasOnboarded && !inTabs && segments[0] !== 'UrgeSupport') router.replace('/(tabs)/Home');
    if (!hasOnboarded && inTabs) router.replace('/Welcome');
  }, [hasOnboarded, isLoaded, segments]);

  if (!isLoaded) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'none', gestureEnabled: true }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="UrgeSupport" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="Welcome" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="NoContactQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FeelingQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FeelingReasonQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingGoalQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingFollowUp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingComfort" options={{ animation: 'slide_from_right' }} />
      </Stack>
      <DailyWelcome />
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><NavigationGate /></AppProvider></SafeAreaProvider>;
}
