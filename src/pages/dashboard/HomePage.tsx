import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { CopyButton } from '@/components/ui/CopyButton';
import { store } from '@/lib/store';
import { useCurrentUser } from '@/lib/useStore';
import { greeting, formatTimeRange, formatDateCard, relativeTime } from '@/lib/datetime';
import type { Booking } from '@/lib/types';

export function HomePage() {
  const user = useCurrentUser();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    store.getBookingsForUser(user.id).then(setBookings);
  }, [user]);

  if (!user) return null;

  const upcoming = bookings
    .filter((b) => b.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextUp = upcoming.slice(0, 3);
  const link = `booktime.app/${user.username}`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Greeting */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-serif text-ink mb-1">
          {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-ink-secondary">Here's what's happening with your scheduling page.</p>
      </div>

      {/* Link card */}
      <div className="card-surface p-6 mb-8 animate-slide-up">
        <p className="text-sm text-ink-secondary mb-2">Your scheduling page</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-lg text-primary-600 font-medium">{link}</p>
            <Link to={`/${user.username}`} className="text-sm text-ink-secondary hover:text-ink inline-flex items-center gap-1 mt-1">
              View page <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CopyButton text={link} />
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink">Upcoming</h2>
          {upcoming.length > 0 && (
            <Link to="/app/bookings" className="text-sm text-ink-secondary hover:text-ink">
              View all
            </Link>
          )}
        </div>

        {nextUp.length > 0 ? (
          <div className="space-y-3">
            {nextUp.map((b) => {
              const card = formatDateCard(b.date);
              return (
                <div key={b.id} className="card-surface p-5 flex items-center gap-4 hover:shadow-card transition-shadow">
                  <div className="w-14 h-14 flex-shrink-0 rounded-btn bg-primary-50 border border-primary-100 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">{card.month}</span>
                    <span className="text-xl font-semibold text-primary-700">{card.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{b.guestName}</p>
                    <p className="text-sm text-ink-secondary truncate">{b.guestEmail}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-ink-secondary">{relativeTime(b.date)}</p>
                    <p className="text-sm font-medium text-ink">{formatTimeRange(b.startTime, b.endTime)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-surface p-10 text-center">
            <CalendarDays className="w-10 h-10 text-ink-tertiary mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-ink-secondary">No upcoming bookings.</p>
            <p className="text-sm text-ink-tertiary mt-1">Share your link to start getting booked.</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-secondary mb-1">Total bookings</p>
          <p className="text-2xl font-semibold text-ink">{bookings.length}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-ink-secondary mb-1">Upcoming</p>
          <p className="text-2xl font-semibold text-ink">{upcoming.length}</p>
        </div>
      </div>
    </div>
  );
}
