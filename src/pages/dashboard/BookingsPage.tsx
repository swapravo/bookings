import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Mail, MessageSquare } from 'lucide-react';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';
import { formatTimeRange, formatDateCard, formatDateShort } from '@/lib/datetime';
import type { Booking } from '@/lib/types';

export function BookingsPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    store.getBookingsForUser(user.id)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const upcoming = bookings
    .filter((b) => b.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = bookings
    .filter((b) => b.status === 'past' || b.status === 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date));

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-serif text-ink mb-1">Bookings</h1>
        <p className="text-ink-secondary">Manage your upcoming and past meetings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 animate-fade-in">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-btn px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-ink text-white' : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
            }`}
          >
            {t} ({t === 'upcoming' ? upcoming.length : past.length})
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="card-surface p-12 text-center">
          <p className="text-ink-secondary">Loading bookings…</p>
        </div>
      ) : list.length > 0 ? (
        <div className="space-y-3 stagger">
          {list.map((b) => {
            const card = formatDateCard(b.date);
            return (
              <div key={b.id} className="card-surface p-5 flex items-center gap-4 hover:shadow-card transition-shadow">
                <div className="w-14 h-14 flex-shrink-0 rounded-btn bg-primary-50 border border-primary-100 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-medium text-primary-700">{card.month}</span>
                  <span className="text-xl font-semibold text-primary-700">{card.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink">{b.guestName}</p>
                  <p className="text-sm text-ink-secondary truncate flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {b.guestEmail}
                  </p>
                  <p className="text-sm text-ink-secondary flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {formatTimeRange(b.startTime, b.endTime)}
                  </p>
                  {b.guestNote && (
                    <p className="text-sm text-ink-secondary flex items-start gap-1.5 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="break-all">{b.guestNote}</span>
                    </p>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-ink-secondary">{formatDateShort(b.date)}</p>
                  {b.status === 'cancelled' && (
                    <p className="text-xs text-error-600 mt-0.5">Cancelled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface p-12 text-center">
          <CalendarDays className="w-10 h-10 text-ink-tertiary mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-ink-secondary">
            {tab === 'upcoming' ? 'No upcoming bookings.' : 'No past bookings yet.'}
          </p>
          {tab === 'upcoming' && (
            <p className="text-sm text-ink-tertiary mt-1">Share your link to start getting booked.</p>
          )}
        </div>
      )}
    </div>
  );
}
