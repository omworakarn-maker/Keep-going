import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { colors } from '../constants/theme';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DailyWelcome } from '../components/DailyWelcome';
import { AppProvider, useApp } from '../context/AppContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function NavigationGate() {
  const { hasOnboarded, isLoaded } = useApp();
  const { user, ready } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isLoaded || !ready) return;
    if (!user) { if (segments[0] !== 'Login') router.replace('/Login'); return; }
    const inTabs = segments[0] === '(tabs)';
    const isHealingTool = segments[0] === 'UrgeSupport' || segments[0] === 'ReleaseLetter' || segments[0] === 'ComponentShowcase' || segments[0] === 'ComponentShowcaseMore';
    if (hasOnboarded && !inTabs && !isHealingTool) router.replace('/(tabs)/Home');
    if (!hasOnboarded && inTabs) router.replace('/Welcome');
    if (!hasOnboarded && segments[0] === 'Login') router.replace('/Welcome');
  }, [hasOnboarded, isLoaded, segments, user, ready]);

  if (!isLoaded || !ready) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'none', gestureEnabled: true }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="UrgeSupport" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="ReleaseLetter" options={{ presentation: 'modal', animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="ComponentShowcase" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ComponentShowcaseMore" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Welcome" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="NoContactQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FeelingQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="FeelingReasonQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingGoalQuestion" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingFollowUp" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="HealingComfort" options={{ animation: 'slide_from_right' }} />
      </Stack>
      {user ? <DailyWelcome /> : null}
    </>
  );
}

export default function RootLayout() {
  return <SafeAreaProvider><PaperProvider theme={{ ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: colors.primary } }}><AuthProvider><AccountLayout /></AuthProvider></PaperProvider></SafeAreaProvider>;
}

function AccountLayout() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  return <AppProvider key={user?.id || 'guest'}><NavigationGate /></AppProvider>;
}
