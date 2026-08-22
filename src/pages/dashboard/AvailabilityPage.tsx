import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';
import { DAYS, WEEKDAY_ORDER } from '@/lib/types';
import type { DayKey, DayAvailability } from '@/lib/types';
import { TIMEZONES } from '@/lib/datetime';

export function AvailabilityPage() {
  const user = useCurrentUser();
  const [availability, setAvailability] = useState<Record<DayKey, DayAvailability> | null>(user?.availability ?? null);
  const [timezone, setTimezone] = useState(user?.timezone ?? 'Asia/Kolkata');
  const [blockedDates, setBlockedDates] = useState<string[]>(user?.blockedDates ?? []);
  const [dateToBlock, setDateToBlock] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || !availability) return null;

  const toggleDay = (key: DayKey) => setAvailability((prev) => prev ? ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }) : prev);
  const updateTime = (key: DayKey, field: 'start' | 'end', value: string) => setAvailability((prev) => prev ? ({ ...prev, [key]: { ...prev[key], [field]: value } }) : prev);

  const saveChanges = async () => {
    if (!availability) return;
    setSaving(true);
    try {
      await store.updateAvailability(user.id, availability);
      await store.updateProfile(user.id, { timezone });
      await store.updateBlockedDates(user.id, blockedDates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = () => {
    if (dateToBlock && !blockedDates.includes(dateToBlock)) {
      setBlockedDates((dates) => [...dates, dateToBlock].sort());
      setDateToBlock('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-ink mb-1">When can people meet you?</h1>
          <p className="text-ink-secondary">Set your weekly hours and block days off.</p>
        </div>
        <Button onClick={saveChanges} size="md" disabled={saving}>
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <div className="card-surface p-5 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-ink mb-5">Weekly schedule</h2>
        <div className="space-y-3">
          {WEEKDAY_ORDER.map((key) => {
            const day = DAYS.find((d) => d.key === key)!;
            const av = availability[key];
            return (
              <div key={key} className="flex items-center gap-3 py-1">
                <button onClick={() => toggleDay(key)} className={`relative w-10 h-5 rounded-full shrink-0 transition-colors ${av.enabled ? 'bg-primary-500' : 'bg-border-strong'}`} aria-label={`Toggle ${day.label}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-soft transition-transform ${av.enabled ? 'translate-x-5' : ''}`} />
                </button>
                <span className={`w-24 text-sm font-medium ${av.enabled ? 'text-ink' : 'text-ink-tertiary'}`}>{day.label}</span>
                {av.enabled ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <TimeSelect value={av.start} onChange={(value) => updateTime(key, 'start', value)} />
                    <span className="text-ink-tertiary">—</span>
                    <TimeSelect value={av.end} onChange={(value) => updateTime(key, 'end', value)} />
                  </div>
                ) : <span className="ml-auto text-sm text-ink-tertiary">Unavailable</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-surface p-5 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-ink mb-1">Timezone</h2>
        <p className="text-sm text-ink-secondary mb-4">Guests will see your availability in their local time.</p>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field cursor-pointer">
          {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
        </select>
      </div>

      <div className="card-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold text-ink mb-1">Block specific dates</h2>
        <p className="text-sm text-ink-secondary mb-4">Keep a day off without changing your weekly schedule.</p>
        <div className="flex gap-2">
          <input type="date" value={dateToBlock} onChange={(e) => setDateToBlock(e.target.value)} className="input-field" />
          <Button onClick={addBlockedDate} variant="outline"><Plus className="w-4 h-4" /> Add</Button>
        </div>
        {blockedDates.length > 0 && <div className="mt-4 space-y-2">{blockedDates.map((date) => <div key={date} className="flex items-center justify-between rounded-btn border border-border bg-background px-4 py-2.5 text-sm"><span>{date}</span><button onClick={() => setBlockedDates((dates) => dates.filter((d) => d !== date))} className="text-ink-tertiary hover:text-error-600"><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    times.push(`${String(hour).padStart(2, '0')}:00`, `${String(hour).padStart(2, '0')}:30`);
  }
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-btn border border-border bg-background px-2 py-1.5 text-sm text-ink outline-none focus:border-primary-500 cursor-pointer">{times.map((time) => <option key={time}>{time}</option>)}</select>;
}
