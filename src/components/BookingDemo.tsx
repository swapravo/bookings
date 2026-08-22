import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Calendar } from '@/components/ui/Calendar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { formatTime, formatTimeRange, formatDateLong, toISODate, getAvailableSlotsForDate } from '@/lib/datetime';
import { Link } from 'react-router-dom';
import { defaultAvailability } from '@/lib/types';
import type { UserProfile } from '@/lib/types';

type Step = 'date' | 'time' | 'details' | 'done';

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + 60;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

// Static demo user — no database needed for the landing page demo
const DEMO_USER: UserProfile = {
  id: 'demo',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  username: 'rahul',
  bio: 'Product designer. Coffee enthusiast.',
  avatarUrl: null,
  timezone: 'Asia/Kolkata',
  availability: defaultAvailability(),
  blockedDates: [],
  createdAt: new Date().toISOString(),
};

export function BookingDemo() {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const slots = selectedDate ? getAvailableSlotsForDate(DEMO_USER, selectedDate) : [];
  const dateStr = selectedDate ? toISODate(selectedDate) : '';

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    setStep('time');
  };

  const handleSelectTime = (t: string) => {
    setSelectedTime(t);
    setStep('details');
  };

  const handleReserve = () => {
    if (!name || !email || !selectedDate) return;
    setStep('done');
  };

  const handleReset = () => {
    setStep('date');
    setSelectedDate(null);
    setSelectedTime('');
    setName('');
    setEmail('');
    setNote('');
  };

  return (
    <div className="card-surface p-6 md:p-8 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Avatar name={DEMO_USER.name} size="lg" />
        <div>
          <h3 className="font-semibold text-lg text-ink">{DEMO_USER.name}</h3>
          <p className="text-sm text-ink-secondary">Product Designer</p>
        </div>
      </div>

      {step === 'date' && (
        <div className="animate-fade-in">
          <p className="text-ink-secondary mb-4">Let's find a time to talk.</p>
          <Calendar user={DEMO_USER} selectedDate={selectedDate} onSelect={handleSelectDate} />
        </div>
      )}

      {step === 'time' && selectedDate && (
        <div className="animate-slide-in-right">
          <button onClick={() => setStep('date')} className="text-sm text-ink-secondary hover:text-ink mb-4 flex items-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="mb-4">
            <p className="text-sm text-ink-secondary">{formatDateLong(dateStr)}</p>
            <p className="font-medium text-ink">Available times</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {slots.length > 0 ? (
              slots.map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectTime(t)}
                  className="w-full flex items-center justify-between rounded-btn border border-border bg-surface text-ink px-4 py-3 text-sm font-medium transition-all hover:border-primary-500 hover:bg-primary-50 active:scale-[0.98]"
                >
                  <span>{formatTime(t)}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-ink-tertiary">No times available.</p>
            )}
          </div>
        </div>
      )}

      {step === 'details' && selectedDate && (
        <div className="animate-slide-in-right">
          <button onClick={() => setStep('time')} className="text-sm text-ink-secondary hover:text-ink mb-4 flex items-center gap-1">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="mb-5 p-4 rounded-btn bg-primary-50 border border-primary-100">
            <p className="font-medium text-ink">{formatDateLong(dateStr)}</p>
            <p className="text-sm text-ink-secondary">{formatTimeRange(selectedTime, addHour(selectedTime))}</p>
          </div>
          <div className="space-y-4">
            <Input
              label="Your name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Your email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Message / Meeting link
                <span className="ml-1.5 text-xs font-normal text-ink-tertiary">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Add a Zoom / Google Meet link, or any note for the host…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-btn border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-tertiary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none transition-colors"
              />
            </div>
            <Button onClick={handleReserve} disabled={!name || !email} size="lg" className="w-full">
              Reserve time
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="animate-scale-in text-center py-8">
          <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-success-100">
            <Check className="w-8 h-8 text-success-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-semibold text-ink mb-2">You're booked.</h3>
          <p className="text-ink-secondary mb-1">{formatDateLong(dateStr)}</p>
          <p className="text-ink-secondary mb-6">{formatTimeRange(selectedTime, addHour(selectedTime))}</p>
          <p className="text-sm text-ink-tertiary mb-6">A confirmation has been sent to your email.</p>
          <div className="space-y-3">
            <Link to="/signup">
              <Button variant="primary" size="lg" className="w-full">
                Want your own? Create your page
              </Button>
            </Link>
            <button onClick={handleReset} className="text-sm text-ink-secondary hover:text-ink">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
