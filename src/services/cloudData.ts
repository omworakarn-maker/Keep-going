import { AppState, DiaryEntry, UrgeEntry } from '../types';
import { loadDailyCheckins, upsertDailyCheckin } from './dailyCheckins';
import { supabase } from './supabase';

const VOICE_BUCKET = 'voice-notes';

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('กรุณาเข้าสู่ระบบ');
  return data.user.id;
}

export async function loadCloudState(): Promise<Partial<AppState> | null> {
  const [settingsResult, diariesResult, urgesResult, entries] = await Promise.all([
    supabase.from('user_settings').select('*').maybeSingle(),
    supabase.from('diary_entries').select('*').order('created_at', { ascending: false }),
    supabase.from('urge_entries').select('*').order('created_at', { ascending: false }),
    loadDailyCheckins(),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (diariesResult.error) throw diariesResult.error;
  if (urgesResult.error) throw urgesResult.error;

  const settings = settingsResult.data;
  const diaryRows = diariesResult.data ?? [];
  const urgeRows = urgesResult.data ?? [];
  if (!settings && !diaryRows.length && !urgeRows.length && !entries.length) return null;

  const diaryEntries: DiaryEntry[] = diaryRows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    content: row.content,
    mood: row.mood ?? undefined,
    emoji: row.emoji ?? undefined,
  }));

  const urgeEntries: UrgeEntry[] = await Promise.all(urgeRows.map(async (row) => {
    let audioUri: string | undefined;
    if (row.audio_path) {
      const { data } = await supabase.storage.from(VOICE_BUCKET).createSignedUrl(row.audio_path, 60 * 60 * 24);
      audioUri = data?.signedUrl;
    }
    return {
      id: row.id,
      createdAt: row.created_at,
      message: row.message,
      kind: row.kind,
      recipient: row.recipient ?? undefined,
      audioUri,
      audioDuration: row.audio_duration ?? undefined,
    };
  }));

  return {
    entries,
    diaryEntries,
    urgeEntries,
    ...(settings ? {
      startDate: settings.start_date,
      healingStartedAt: settings.healing_started_at,
      hasOnboarded: settings.has_onboarded,
      healingGoal: settings.healing_goal,
      currentFeeling: settings.current_feeling,
      feelingReason: settings.feeling_reason,
      feelingNote: settings.feeling_note,
      healingAnswer: settings.healing_answer,
      lastDailyWelcomeDate: settings.last_daily_welcome_date ?? '',
      allowEarlyWeeklySummary: settings.allow_early_weekly_summary,
      selfReasons: Array.isArray(settings.self_reasons) ? settings.self_reasons : [],
      notificationsEnabled: settings.notifications_enabled,
      notificationTime: String(settings.notification_time).slice(0, 5),
    } : {}),
  };
}

export async function saveCloudSettings(state: AppState) {
  const userId = await currentUserId();
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userId,
    start_date: state.startDate,
    healing_started_at: state.healingStartedAt,
    has_onboarded: state.hasOnboarded,
    healing_goal: state.healingGoal,
    current_feeling: state.currentFeeling,
    feeling_reason: state.feelingReason,
    feeling_note: state.feelingNote,
    healing_answer: state.healingAnswer,
    last_daily_welcome_date: state.lastDailyWelcomeDate || null,
    allow_early_weekly_summary: state.allowEarlyWeeklySummary,
    self_reasons: state.selfReasons,
    notifications_enabled: state.notificationsEnabled,
    notification_time: state.notificationTime,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function upsertDiaryEntry(entry: DiaryEntry) {
  const userId = await currentUserId();
  const { error } = await supabase.from('diary_entries').upsert({
    user_id: userId,
    id: entry.id,
    created_at: entry.createdAt,
    title: entry.title,
    content: entry.content,
    mood: entry.mood ?? null,
    emoji: entry.emoji ?? null,
  }, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function deleteCloudDiaryEntry(id: string) {
  const userId = await currentUserId();
  const { error } = await supabase.from('diary_entries').delete().eq('user_id', userId).eq('id', id);
  if (error) throw error;
}

export async function upsertUrgeEntry(entry: UrgeEntry) {
  const userId = await currentUserId();
  let audioPath: string | undefined;
  if (entry.audioUri && !entry.audioUri.startsWith('http')) {
    audioPath = `${userId}/${entry.id}.m4a`;
    const response = await fetch(entry.audioUri);
    const audio = await response.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(VOICE_BUCKET)
      .upload(audioPath, audio, { contentType: 'audio/mp4', upsert: true });
    if (uploadError) throw uploadError;
  }

  const row = {
    user_id: userId,
    id: entry.id,
    created_at: entry.createdAt,
    message: entry.message,
    kind: entry.kind ?? 'message',
    recipient: entry.recipient ?? null,
    audio_duration: entry.audioDuration ?? null,
    ...(audioPath ? { audio_path: audioPath } : {}),
  };
  const { error } = await supabase.from('urge_entries').upsert(row, { onConflict: 'user_id,id' });
  if (error) throw error;
}

export async function deleteCloudUrgeEntry(id: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('urge_entries')
    .delete()
    .eq('user_id', userId)
    .eq('id', id)
    .select('audio_path')
    .maybeSingle();
  if (error) throw error;
  if (data?.audio_path) await supabase.storage.from(VOICE_BUCKET).remove([data.audio_path]);
}

export async function migrateStateToCloud(state: AppState) {
  await saveCloudSettings(state);
  await Promise.all([
    ...state.entries.map(upsertDailyCheckin),
    ...state.diaryEntries.map(upsertDiaryEntry),
    ...state.urgeEntries.map(upsertUrgeEntry),
  ]);
}

export async function clearCloudData() {
  const userId = await currentUserId();
  const { data: files } = await supabase.storage.from(VOICE_BUCKET).list(userId);
  if (files?.length) await supabase.storage.from(VOICE_BUCKET).remove(files.map((file) => `${userId}/${file.name}`));
  await Promise.all([
    supabase.from('daily_checkins').delete().eq('user_id', userId),
    supabase.from('diary_entries').delete().eq('user_id', userId),
    supabase.from('urge_entries').delete().eq('user_id', userId),
    supabase.from('user_settings').delete().eq('user_id', userId),
  ]);
}
