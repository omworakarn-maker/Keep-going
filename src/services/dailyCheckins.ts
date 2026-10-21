import { Entry } from '../types';
import { supabase } from './supabase';

type DailyCheckinRow = {
  id: string;
  checkin_date: string;
  mood: string;
  emoji: string;
  note: string;
};

function rowToEntry(row: DailyCheckinRow): Entry {
  return { id: row.id, date: row.checkin_date, mood: row.mood, emoji: row.emoji, note: row.note };
}

export async function loadDailyCheckins(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('id, checkin_date, mood, emoji, note')
    .order('checkin_date', { ascending: false });
  if (error) throw error;
  return (data as DailyCheckinRow[]).map(rowToEntry);
}

export async function upsertDailyCheckin(entry: Entry): Promise<Entry> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('กรุณาเข้าสู่ระบบ');

  const { data, error } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: authData.user.id,
      checkin_date: entry.date,
      mood: entry.mood,
      emoji: entry.emoji,
      note: entry.note,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,checkin_date' })
    .select('id, checkin_date, mood, emoji, note')
    .single();
  if (error) throw error;
  return rowToEntry(data as DailyCheckinRow);
}
