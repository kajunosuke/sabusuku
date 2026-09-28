import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Subscription } from './types';

const KEY = 'subscriptions:v1';

export async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Subscription[]) : [];
  } catch {
    return [];
  }
}

export async function saveSubscriptions(list: Subscription[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
