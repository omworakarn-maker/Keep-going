import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { DailyWelcome } from './src/components/DailyWelcome';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppContent() {
  const { isLoaded } = useApp();
  if (!isLoaded) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
      <DailyWelcome />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
