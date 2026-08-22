import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = '@tee_la_wan/state';

export async function loadState(): Promise<Partial<AppState> | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  return value ? JSON.parse(value) : null;
}

export async function saveState(state: AppState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
