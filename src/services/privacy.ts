import * as SecureStore from 'expo-secure-store';

const LOCK_ENABLED_KEY = 'keep-going-lock-enabled';
const PASSCODE_KEY = 'keep-going-passcode';
const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function isAppLockEnabled() {
  return (await SecureStore.getItemAsync(LOCK_ENABLED_KEY, secureOptions)) === 'true';
}

export async function enableAppLock(passcode: string) {
  await SecureStore.setItemAsync(PASSCODE_KEY, passcode, secureOptions);
  await SecureStore.setItemAsync(LOCK_ENABLED_KEY, 'true', secureOptions);
}

export async function disableAppLock() {
  await SecureStore.deleteItemAsync(PASSCODE_KEY, secureOptions);
  await SecureStore.deleteItemAsync(LOCK_ENABLED_KEY, secureOptions);
}

export async function verifyAppPasscode(passcode: string) {
  const saved = await SecureStore.getItemAsync(PASSCODE_KEY, secureOptions);
  return Boolean(saved) && saved === passcode;
}
