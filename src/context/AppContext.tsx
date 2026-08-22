import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { healingGoals, moods } from '../constants/theme';
import { clearState, loadState, saveState } from '../services/storage';
import { AppState, DiaryEntry, Entry, Mood, UrgeEntry } from '../types';
import { dateFromDaysAgo, isoToday } from '../utils/date';

type AppContextValue = AppState & {
  isLoaded: boolean;
  addEntry: (mood: Mood, note: string) => void;
  addDiaryEntry: (title: string, content: string, mood?: Mood) => void;
  deleteDiaryEntry: (id: string) => void;
  addUrgeEntry: (message: string, audioUri?: string | null, audioDuration?: number) => Promise<void>;
  deleteUrgeEntry: (id: string) => Promise<void>;
  finishOnboarding: (days: number, feeling: string, feelingReason: string, feelingNote: string, goal: string, answer: string) => void;
  updateStartDate: (date: string) => void;
  dismissDailyWelcome: () => void;
  resetApp: () => Promise<void>;
};

const initialState: AppState = {
  startDate: isoToday(),
  healingStartedAt: new Date().toISOString(),
  entries: [],
  diaryEntries: [],
  urgeEntries: [],
  hasOnboarded: false,
  healingGoal: healingGoals[0],
  currentFeeling: '',
  feelingReason: '',
  feelingNote: '',
  healingAnswer: '',
  lastDailyWelcomeDate: '',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadState()
      .then((saved) => saved && setState((current) => ({ ...current, ...saved })))
      .finally(() => setIsLoaded(true));
  }, []);

  useEffect(() => {
    if (isLoaded) saveState(state);
  }, [state, isLoaded]);

  const addEntry = (mood: Mood, note: string) => {
    const entry: Entry = { id: String(Date.now()), date: isoToday(), mood: mood.label, emoji: mood.emoji, note };
    setState((current) => ({ ...current, entries: [entry, ...current.entries.filter((item) => item.date !== entry.date)] }));
  };

  const addDiaryEntry = (title: string, content: string, mood?: Mood) => {
    const diaryEntry: DiaryEntry = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      title: title.trim() || 'บันทึกของฉัน',
      content: content.trim(),
      mood: mood?.label,
      emoji: mood?.emoji,
    };
    setState((current) => ({ ...current, diaryEntries: [diaryEntry, ...current.diaryEntries] }));
  };

  const deleteDiaryEntry = (id: string) =>
    setState((current) => ({ ...current, diaryEntries: current.diaryEntries.filter((entry) => entry.id !== id) }));

  const addUrgeEntry = async (message: string, audioUri?: string | null, audioDuration?: number) => {
    if (!message.trim() && !audioUri) return;
    const id = String(Date.now());
    let savedAudioUri: string | undefined;
    if (audioUri && FileSystem.documentDirectory) {
      const directory = `${FileSystem.documentDirectory}unsent/`;
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      savedAudioUri = `${directory}${id}.m4a`;
      await FileSystem.copyAsync({ from: audioUri, to: savedAudioUri });
    }
    const entry: UrgeEntry = { id, createdAt: new Date().toISOString(), message: message.trim(), audioUri: savedAudioUri, audioDuration };
    setState((current) => ({ ...current, urgeEntries: [entry, ...(current.urgeEntries ?? [])] }));
  };

  const deleteUrgeEntry = async (id: string) => {
    const target = state.urgeEntries?.find((entry) => entry.id === id);
    if (target?.audioUri) await FileSystem.deleteAsync(target.audioUri, { idempotent: true });
    setState((current) => ({ ...current, urgeEntries: (current.urgeEntries ?? []).filter((entry) => entry.id !== id) }));
  };

  const finishOnboarding = (days: number, currentFeeling: string, feelingReason: string, feelingNote: string, goal: string, healingAnswer: string) =>
    setState((current) => ({ ...current, startDate: dateFromDaysAgo(days), healingStartedAt: new Date().toISOString(), currentFeeling, feelingReason, feelingNote, healingGoal: goal, healingAnswer, hasOnboarded: true, lastDailyWelcomeDate: isoToday() }));

  const updateStartDate = (startDate: string) => setState((current) => ({ ...current, startDate }));
  const dismissDailyWelcome = () => setState((current) => ({ ...current, lastDailyWelcomeDate: isoToday() }));

  const resetApp = async () => {
    await clearState();
    setState(initialState);
  };

  return <AppContext.Provider value={{ ...state, urgeEntries: state.urgeEntries ?? [], isLoaded, addEntry, addDiaryEntry, deleteDiaryEntry, addUrgeEntry, deleteUrgeEntry, finishOnboarding, updateStartDate, dismissDailyWelcome, resetApp }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}
