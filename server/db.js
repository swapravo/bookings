import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    username    TEXT UNIQUE,
    bio         TEXT NOT NULL DEFAULT '',
    avatar_url  TEXT,
    timezone    TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS availability (
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_key    TEXT NOT NULL,
    enabled    INTEGER NOT NULL DEFAULT 0,
    start_time TEXT NOT NULL DEFAULT '09:00',
    end_time   TEXT NOT NULL DEFAULT '17:00',
    PRIMARY KEY (user_id, day_key)
  );

  CREATE TABLE IF NOT EXISTS blocked_dates (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date    TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    start_time  TEXT NOT NULL,
    end_time    TEXT NOT NULL,
    guest_name  TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_note  TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'upcoming',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migrate existing databases that don't have guest_note yet
try {
  db.exec(`ALTER TABLE bookings ADD COLUMN guest_note TEXT NOT NULL DEFAULT ''`);
} catch {
  // Column already exists — safe to ignore
}

// --- Helpers ---

/** Fetch full availability record for a user (all 7 days). */
export function getAvailability(userId) {
  const rows = db.prepare('SELECT * FROM availability WHERE user_id = ?').all(userId);
  const result = {};
  for (const row of rows) {
    result[row.day_key] = {
      enabled: row.enabled === 1,
      start: row.start_time,
      end: row.end_time,
    };
  }
  return result;
}

/** Upsert availability for all days provided. */
export function setAvailability(userId, availability) {
  const upsert = db.prepare(`
    INSERT INTO availability (user_id, day_key, enabled, start_time, end_time)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, day_key) DO UPDATE SET
      enabled    = excluded.enabled,
      start_time = excluded.start_time,
      end_time   = excluded.end_time
  `);
  const transaction = db.transaction((avail) => {
    for (const [dayKey, val] of Object.entries(avail)) {
      upsert.run(userId, dayKey, val.enabled ? 1 : 0, val.start, val.end);
    }
  });
  transaction(availability);
}

/** Fetch blocked dates array for a user. */
export function getBlockedDates(userId) {
  return db.prepare('SELECT date FROM blocked_dates WHERE user_id = ?').all(userId).map(r => r.date);
}

/** Replace blocked dates for a user. */
export function setBlockedDates(userId, dates) {
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM blocked_dates WHERE user_id = ?').run(userId);
    const insert = db.prepare('INSERT OR IGNORE INTO blocked_dates (user_id, date) VALUES (?, ?)');
    for (const date of dates) insert.run(userId, date);
  });
  transaction();
}

export default db;
