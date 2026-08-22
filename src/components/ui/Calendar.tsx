import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGrid, toISODate, isSameDay, isPastDate, isToday } from '@/lib/datetime';
import type { UserProfile } from '@/lib/types';
import { getAvailableSlotsForDate } from '@/lib/datetime';

interface CalendarProps {
  user: UserProfile;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function Calendar({ user, selectedDate, onSelect, minDate }: CalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const weeks = getMonthGrid(viewYear, viewMonth);
  const minD = minDate ?? today;

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const canGoPrev = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    const min = new Date(minD.getFullYear(), minD.getMonth(), 1);
    return prev >= min;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-ink">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            disabled={!canGoPrev()}
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary transition-all hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="w-9 h-9 flex items-center justify-center rounded-full text-ink-secondary transition-all hover:bg-ink/5 hover:text-ink"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-ink-tertiary py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, idx) => {
          if (!date) return <div key={idx} className="aspect-square" />;

          const dateStr = toISODate(date);
          const isPast = isPastDate(date) || date < minD;
          const slots = getAvailableSlotsForDate(user, date);
          const hasSlots = slots.length > 0 && !isPast;
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const todayHighlight = isToday(date);

          return (
            <button
              key={idx}
              disabled={!hasSlots}
              onClick={() => onSelect(date)}
              className={`
                relative aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-200
                ${isSelected
                  ? 'bg-primary-500 text-white font-semibold shadow-soft scale-105'
                  : hasSlots
                    ? 'text-ink hover:bg-primary-50 hover:scale-105 cursor-pointer'
                    : 'text-ink-tertiary/40 cursor-not-allowed'
                }
              `}
            >
              <span>{date.getDate()}</span>
              {hasSlots && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
              )}
              {todayHighlight && !isSelected && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ink/30" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
