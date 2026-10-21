import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '../types';

const STORAGE_KEY = '@tee_la_wan/state';

export async function loadState(userId?: string): Promise<Partial<AppState> | null> {
  const value = await AsyncStorage.getItem(userId ? `${STORAGE_KEY}/${userId}` : STORAGE_KEY);
  return value ? JSON.parse(value) : null;
}

export async function saveState(state: AppState, userId?: string) {
  await AsyncStorage.setItem(userId ? `${STORAGE_KEY}/${userId}` : STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(userId?: string) {
  await AsyncStorage.removeItem(userId ? `${STORAGE_KEY}/${userId}` : STORAGE_KEY);
}
