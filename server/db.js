import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xyz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake-key';

// Initialize Supabase client
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Helpers ---

/** Fetch full availability record for a user (all 7 days). */
export async function getAvailability(userId) {
  const { data, error } = await db
    .from('availability')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  const result = {};
  for (const row of data || []) {
    result[row.day_key] = {
      enabled: row.enabled,
      start: row.start_time,
      end: row.end_time,
    };
  }
  return result;
}

/** Upsert availability for all days provided. */
export async function setAvailability(userId, availability) {
  const rowsToUpsert = Object.entries(availability).map(([dayKey, val]) => ({
    user_id: userId,
    day_key: dayKey,
    enabled: val.enabled,
    start_time: val.start,
    end_time: val.end,
  }));

  const { error } = await db
    .from('availability')
    .upsert(rowsToUpsert, { onConflict: 'user_id,day_key' });

  if (error) throw error;
}

/** Fetch blocked dates array for a user. */
export async function getBlockedDates(userId) {
  const { data, error } = await db
    .from('blocked_dates')
    .select('date')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map(r => r.date);
}

/** Replace blocked dates for a user. */
export async function setBlockedDates(userId, dates) {
  // Delete existing
  const { error: delError } = await db
    .from('blocked_dates')
    .delete()
    .eq('user_id', userId);
  if (delError) throw delError;

  // Insert new
  if (dates && dates.length > 0) {
    const rowsToInsert = dates.map(date => ({ user_id: userId, date }));
    const { error: insError } = await db
      .from('blocked_dates')
      .insert(rowsToInsert);
    if (insError) throw insError;
  }
}

export default db;
