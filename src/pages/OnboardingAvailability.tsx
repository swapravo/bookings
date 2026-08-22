import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';
import { DAYS, WEEKDAY_ORDER, defaultAvailability } from '@/lib/types';
import type { DayKey, DayAvailability } from '@/lib/types';
import { TIMEZONES } from '@/lib/datetime';

export function OnboardingAvailability() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [availability, setAvailability] = useState<Record<DayKey, DayAvailability>>(
    user?.availability ?? defaultAvailability()
  );
  const [timezone, setTimezone] = useState(user?.timezone ?? 'Asia/Kolkata');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate('/signup');
  }, [user, navigate]);

  if (!user) return null;

  const toggleDay = (key: DayKey) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateTime = (key: DayKey, field: 'start' | 'end', value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await store.updateAvailability(user.id, availability);
      await store.updateProfile(user.id, { timezone });
      navigate('/onboarding/done');
    } catch {
      // ignore, navigate anyway
      navigate('/onboarding/done');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container-page py-8">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-serif text-ink mb-2">When can people meet you?</h1>
            <p className="text-ink-secondary">Set your weekly availability. You can change this later.</p>
          </div>

          <div className="space-y-3 mb-6 animate-fade-in">
            {WEEKDAY_ORDER.map((key) => {
              const day = DAYS.find((d) => d.key === key)!;
              const av = availability[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-4 rounded-btn border px-4 py-3 transition-all ${
                    av.enabled ? 'border-border bg-surface' : 'border-border bg-background'
                  }`}
                >
                  <div className="w-24 flex items-center gap-2">
                    <span className={`text-sm font-medium ${av.enabled ? 'text-ink' : 'text-ink-tertiary'}`}>
                      {day.label}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDay(key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      av.enabled ? 'bg-primary-500' : 'bg-border-strong'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-soft transition-transform ${
                        av.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                  {av.enabled ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <TimeSelect
                        value={av.start}
                        onChange={(v) => updateTime(key, 'start', v)}
                      />
                      <span className="text-ink-tertiary text-sm">—</span>
                      <TimeSelect
                        value={av.end}
                        onChange={(v) => updateTime(key, 'end', v)}
                      />
                    </div>
                  ) : (
                    <span className="ml-auto text-sm text-ink-tertiary">Off</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mb-8 animate-fade-in">
            <label className="block text-sm font-medium text-ink mb-1.5">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-field cursor-pointer"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleContinue} size="lg" className="w-full" disabled={saving}>
            {saving ? 'Saving…' : <>Create my page <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
    times.push(`${String(h).padStart(2, '0')}:30`);
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-btn border border-border bg-background px-3 py-1.5 text-sm text-ink outline-none focus:border-primary-500 cursor-pointer"
    >
      {times.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
