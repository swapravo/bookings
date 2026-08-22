export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayAvailability {
  enabled: boolean;
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  timezone: string;
  availability: Record<DayKey, DayAvailability>;
  blockedDates: string[]; // ISO date strings "2026-08-25"
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  date: string;       // ISO date "2026-08-25"
  startTime: string;   // "14:00"
  endTime: string;     // "15:00"
  guestName: string;
  guestEmail: string;
  guestNote: string;  // optional message / meeting link from the guest
  status: 'upcoming' | 'past' | 'cancelled';
  createdAt: string;
}

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'sun', label: 'Sunday', short: 'Sun' },
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
];

export const WEEKDAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DEFAULT_AVAILABILITY: Record<DayKey, DayAvailability> = {
  mon: { enabled: true, start: '09:00', end: '17:00' },
  tue: { enabled: true, start: '09:00', end: '17:00' },
  wed: { enabled: true, start: '09:00', end: '17:00' },
  thu: { enabled: true, start: '09:00', end: '17:00' },
  fri: { enabled: true, start: '09:00', end: '15:00' },
  sat: { enabled: false, start: '09:00', end: '17:00' },
  sun: { enabled: false, start: '09:00', end: '17:00' },
};

export function defaultAvailability(): Record<DayKey, DayAvailability> {
  return JSON.parse(JSON.stringify(DEFAULT_AVAILABILITY));
}
