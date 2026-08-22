import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/Calendar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { store } from '@/lib/store';
import {
  formatTime,
  formatTimeRange,
  formatDateLong,
  toISODate,
  getAvailableSlotsForDate,
} from '@/lib/datetime';
import type { UserProfile } from '@/lib/types';

type Step = 'date' | 'time' | 'details' | 'done';

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + 60;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null | undefined>(undefined); // undefined = loading
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [reserving, setReserving] = useState(false);

  // Load the host's public profile
  useEffect(() => {
    if (!username) return;
    store.getUserByUsername(username).then((u) => setUser(u));
  }, [username]);

  // Pre-fetch booked slots when a date is selected
  useEffect(() => {
    if (!user || !selectedDate) return;
    const dateStr = toISODate(selectedDate);
    const slots = getAvailableSlotsForDate(user, selectedDate);
    const checks = slots.map((t) =>
      store.isSlotBooked(user.id, dateStr, t).then((booked) => ({ t, booked }))
    );
    Promise.all(checks).then((results) => {
      const booked = new Set(results.filter((r) => r.booked).map((r) => r.t));
      setBookedSlots(booked);
    });
  }, [user, selectedDate]);

  // Still loading
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-ink-secondary">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif text-ink mb-3">Page not found</h1>
          <p className="text-ink-secondary mb-6">
            This scheduling page doesn't exist or hasn't been set up yet.
          </p>
          <Link to="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const slots = selectedDate ? getAvailableSlotsForDate(user, selectedDate) : [];
  const dateStr = selectedDate ? toISODate(selectedDate) : '';

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    setBookedSlots(new Set()); // reset while new slots load
    setStep('time');
  };

  const handleSelectTime = (t: string) => {
    setSelectedTime(t);
    setStep('details');
  };

  const handleReserve = async () => {
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setReserving(true);
    try {
      await store.createBooking({
        userId: user.id,
        date: dateStr,
        startTime: selectedTime,
        endTime: addHour(selectedTime),
        guestName: name.trim(),
        guestEmail: email.trim(),
        guestNote: note.trim(),
      });
      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to book. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar */}
      <div className="container-page py-6 flex items-center justify-between">
        <Logo size="sm" />
        <Link to="/signup" className="text-sm text-ink-secondary hover:text-ink transition-colors">
          Create your own page
        </Link>
      </div>

      <div className="container-page pb-20">
        <div className="max-w-md mx-auto">
          {/* Profile header */}
          <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
            <Avatar name={user.name} src={user.avatarUrl} size="xl" />
            <h1 className="text-2xl md:text-3xl font-serif text-ink mt-4 mb-1">{user.name}</h1>
            {user.bio && <p className="text-ink-secondary text-sm max-w-xs">{user.bio}</p>}
            <p className="text-sm text-ink-tertiary mt-3">Let's find a time to talk.</p>
          </div>

          {/* Booking card */}
          <div className="card-surface p-6 md:p-8">
            {step === 'date' && (
              <div className="animate-fade-in">
                <p className="text-ink-secondary mb-4 text-sm">Choose a date</p>
                <Calendar user={user} selectedDate={selectedDate} onSelect={handleSelectDate} />
              </div>
            )}

            {step === 'time' && selectedDate && (
              <div className="animate-slide-in-right">
                <button
                  onClick={() => setStep('date')}
                  className="text-sm text-ink-secondary hover:text-ink mb-4 flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>
                <div className="mb-4">
                  <p className="text-sm text-ink-secondary">{formatDateLong(dateStr)}</p>
                  <p className="font-medium text-ink">Available times</p>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                  {slots.length > 0 ? (
                    slots.map((t) => {
                      const booked = bookedSlots.has(t);
                      return (
                        <button
                          key={t}
                          disabled={booked}
                          onClick={() => handleSelectTime(t)}
                          className={`w-full flex items-center justify-between rounded-btn border px-4 py-3 text-sm font-medium transition-all ${
                            booked
                              ? 'border-border bg-background text-ink-tertiary cursor-not-allowed'
                              : 'border-border bg-surface text-ink hover:border-primary-500 hover:bg-primary-50 active:scale-[0.98]'
                          }`}
                        >
                          <span>{formatTime(t)}</span>
                          {booked && <span className="text-xs">Booked</span>}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-tertiary">No times available.</p>
                  )}
                </div>
              </div>
            )}

            {step === 'details' && selectedDate && (
              <div className="animate-slide-in-right">
                <button
                  onClick={() => setStep('time')}
                  className="text-sm text-ink-secondary hover:text-ink mb-4 flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back
                </button>
                <div className="mb-5 p-4 rounded-btn bg-primary-50 border border-primary-100">
                  <p className="font-medium text-ink">{formatDateLong(dateStr)}</p>
                  <p className="text-sm text-ink-secondary flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {formatTimeRange(selectedTime, addHour(selectedTime))}
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Your name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    disabled={reserving}
                  />
                  <Input
                    label="Your email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={reserving}
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
                      disabled={reserving}
                      className="w-full rounded-btn border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-tertiary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none transition-colors"
                    />
                  </div>
                  {error && <p className="text-sm text-error-600">{error}</p>}
                  <Button
                    onClick={handleReserve}
                    disabled={!name || !email || reserving}
                    size="lg"
                    className="w-full"
                  >
                    {reserving ? 'Booking…' : 'Reserve time'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="animate-scale-in text-center py-6">
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-full bg-success-100">
                  <Check className="w-8 h-8 text-success-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-semibold text-ink mb-2">You're booked.</h2>
                <p className="text-ink-secondary mb-1">{formatDateLong(dateStr)}</p>
                <p className="text-ink-secondary mb-1">{formatTimeRange(selectedTime, addHour(selectedTime))}</p>
                <p className="text-sm text-ink-tertiary mb-1">With {user.name}</p>
                <p className="text-sm text-ink-tertiary mb-6">A confirmation has been sent to your email.</p>
                <Button variant="outline" size="lg" onClick={() => navigate('/')} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink transition-colors">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
