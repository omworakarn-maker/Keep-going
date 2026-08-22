export type Entry = {
  id: string;
  date: string;
  mood: string;
  emoji: string;
  note: string;
};

export type Mood = {
  label: string;
  emoji: string;
  color: string;
};

export type DiaryEntry = {
  id: string;
  createdAt: string;
  title: string;
  content: string;
  mood?: string;
  emoji?: string;
};

export type UrgeEntry = {
  id: string;
  createdAt: string;
  message: string;
  audioUri?: string;
  audioDuration?: number;
};

export type AppState = {
  startDate: string;
  healingStartedAt: string;
  entries: Entry[];
  diaryEntries: DiaryEntry[];
  urgeEntries: UrgeEntry[];
  hasOnboarded: boolean;
  healingGoal: string;
  currentFeeling: string;
  feelingReason: string;
  feelingNote: string;
  healingAnswer: string;
  lastDailyWelcomeDate: string;
};

export type RootStackParamList = {
  Welcome: undefined;
  NoContactQuestion: undefined;
  FeelingQuestion: { days: number };
  FeelingReasonQuestion: { days: number; feeling: string };
  HealingGoalQuestion: { days: number; feeling: string; feelingReason: string; feelingNote: string };
  HealingFollowUp: { days: number; feeling: string; feelingReason: string; feelingNote: string; goal: string };
  HealingComfort: { days: number; feeling: string; feelingReason: string; feelingNote: string; goal: string; answer: string };
  Main: undefined;
  UrgeSupport: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  History: undefined;
  Progress: undefined;
  Settings: undefined;
};
