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
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="UrgeSupport" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack>
      <DailyWelcome />
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><AppProvider><NavigationGate /></AppProvider></SafeAreaProvider>;
}
