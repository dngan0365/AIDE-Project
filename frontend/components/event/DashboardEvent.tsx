'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, ChevronRight, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import {
  listEvents,
  listActiveEvents,
  type Event,
} from '@/api/event'; // adjust import path as needed

// ── Constants ──────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEMS_PER_PAGE = 6;

const CATEGORY_COLORS: Record<string, string> = {
  Cultural:   'bg-[#4ad4e4]/15 text-[#2ab8cc] dark:bg-[#4ad4e4]/20 dark:text-[#4ad4e4]',
  Festival:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Art:        'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Literature: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Fashion:    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Film:       'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  Wellness:   'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  Heritage:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Food:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function getMonthIndex(monthShort: string): number {
  return MONTHS.indexOf(monthShort);
}

/**
 * Filter a flat Event[] list to only those whose started_at falls in the given month (0-based)
 * within the current year.
 */
function filterByMonth(events: Event[], monthIndex: number): Event[] {
  return events.filter((e) => {
    const d = new Date(e.started_at);
    return d.getMonth() === monthIndex;
  });
}

/**
 * Return the set of month indices that contain at least one event.
 */
function monthsWithEvents(events: Event[]): Set<number> {
  const s = new Set<number>();
  events.forEach((e) => s.add(new Date(e.started_at).getMonth()));
  return s;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Derive a display category from an event if not present
function getCategory(event: Event): string {
  return 'Cultural'; // default fallback — extend if your API returns a category field
}

// ── Component ──────────────────────────────────────────────────────────────
export default function DashboardEvent() {
  const currentMonthIndex = new Date().getMonth();
  const [activeMonth, setActiveMonth] = useState(MONTHS[currentMonthIndex]);

  // All events for the year (used to build month dots)
  const [yearEvents, setYearEvents] = useState<Event[]>([]);
  // Events for the currently selected month
  const [monthEvents, setMonthEvents] = useState<Event[]>([]);

  const [loadingYear, setLoadingYear] = useState(true);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch all year events once (for month dot indicators) ──
  useEffect(() => {
    setLoadingYear(true);
    setError(null);
    listEvents()
      .then((data) => {
        setYearEvents(data);
        // Seed the initial month view from the already-fetched data
        setMonthEvents(filterByMonth(data, currentMonthIndex));
      })
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoadingYear(false));
  }, [currentMonthIndex]);

  // ── Fetch events for selected month ──
  const loadMonth = useCallback(
    async (month: string) => {
      const idx = getMonthIndex(month);

      // Optimistically filter from the cached year list first
      setMonthEvents(filterByMonth(yearEvents, idx));
      setCurrentPage(1);

      // Then fetch fresh data for that month
      setLoadingMonth(true);
      setError(null);
      try {
        const all = await listEvents();
        setYearEvents(all); // keep year cache fresh
        setMonthEvents(filterByMonth(all, idx));
      } catch {
        setError('Failed to load events for this month.');
      } finally {
        setLoadingMonth(false);
      }
    },
    [yearEvents]
  );

  const handleMonthChange = (month: string) => {
    setActiveMonth(month);
    loadMonth(month);
  };

  // ── Pagination ──
  const totalPages = Math.ceil(monthEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = monthEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeDots = monthsWithEvents(yearEvents);
  const activeMonthIndex = getMonthIndex(activeMonth);

  // ── Render ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* Header */}
      <header className="text-center mb-10">
        <span className="font-body text-[0.7rem] tracking-[0.18em] uppercase px-3 py-[3px] border border-[#4ad4e4] text-[#4ad4e4] rounded-full">
          Upcoming
        </span>
        <h1 className="font-display font-black text-[clamp(2.4rem,5vw,3.8rem)] text-[#4ad4e4] mt-3 leading-none">
          What&apos;s On
        </h1>
        <p className="font-body text-[#1e3a42] dark:text-[#8ecfda] text-[clamp(1rem,2vw,1.3rem)] mt-2 font-light">
          Discover upcoming events across Southeast Asia
        </p>
      </header>

      {/* Month Selector */}
      <div className="bg-[#f0fbfc] dark:bg-[#071318] border border-[rgba(74,212,228,0.2)] rounded-2xl p-5 mb-10">
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {MONTHS.map((month, idx) => {
            const hasEvents = activeDots.has(idx);
            const isActive = activeMonth === month;
            return (
              <button
                key={month}
                onClick={() => handleMonthChange(month)}
                className={`relative rounded-xl px-2 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#4ad4e4] text-white shadow-md shadow-[#4ad4e4]/30'
                    : 'text-[#2e5a6a] dark:text-[#5ba8b8] hover:bg-[#4ad4e4]/15 dark:hover:bg-[#4ad4e4]/10 hover:text-[#4ad4e4]'
                }`}
              >
                {month}
                {hasEvents && !isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#4ad4e4]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative flex items-center justify-between mt-5 px-3">
          <div className="absolute h-[2px] bg-gradient-to-r from-[#4ad4e4]/30 via-[#4ad4e4] to-[#4ad4e4]/30 w-full left-0" />
          {MONTHS.map((month, idx) => (
            <button
              aria-label={`Select ${month}`}
              key={`dot-${month}`}
              onClick={() => handleMonthChange(month)}
              className={`w-3 h-3 rounded-full z-10 transition-all duration-200 ${
                activeMonth === month
                  ? 'bg-[#4ad4e4] scale-150 shadow-sm shadow-[#4ad4e4]/50'
                  : 'bg-white dark:bg-[#0a1e24] border-2 border-[#4ad4e4]/40 hover:border-[#4ad4e4]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Month Label */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-[1.4rem] text-[#0e1f24] dark:text-[#d4f1f5]">
          {activeMonth} Events
          {!loadingMonth && (
            <span className="ml-3 font-body font-normal text-sm text-[#4ad4e4]">
              {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </h2>

        {loadingMonth && (
          <Loader2 className="w-5 h-5 text-[#4ad4e4] animate-spin" />
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={() => loadMonth(activeMonth)}
            className="ml-auto text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Initial Loading Skeleton */}
      {loadingYear && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-[rgba(74,212,228,0.15)] bg-white dark:bg-[#0a1e24] animate-pulse"
            >
              <div className="h-52 bg-[#e0f7fa] dark:bg-[#0d2b33]" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded w-3/4" />
                <div className="h-3 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded w-1/2" />
                <div className="h-3 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded w-full" />
                <div className="h-3 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Events Grid */}
      {!loadingYear && !error && paginatedEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((event, i) => {
            const category = getCategory(event);
            return (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="group block bg-white dark:bg-[#0a1e24] rounded-2xl overflow-hidden border border-[rgba(74,212,228,0.15)] dark:border-[rgba(74,212,228,0.1)] shadow-sm hover:shadow-[0_8px_30px_rgba(74,212,228,0.15)] dark:hover:shadow-[0_8px_30px_rgba(74,212,228,0.12)] transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Cover image */}
                <div className="relative w-full h-52 overflow-hidden bg-[#071318]">
                  {event.img_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.img_url}
                      alt={event.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    /* Placeholder when no image */
                    <div className="w-full h-full bg-gradient-to-br from-[#0d2b33] to-[#071318] flex items-center justify-center">
                      <CalendarDays className="w-12 h-12 text-[#4ad4e4]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Category pill */}
                  <span
                    className={`absolute top-3 left-3 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full ${
                      CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Cultural
                    }`}
                  >
                    {category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display font-bold text-[1.05rem] leading-snug text-[#0e1f24] dark:text-[#d4f1f5] group-hover:text-[#4ad4e4] dark:group-hover:text-[#4ad4e4] transition-colors line-clamp-2 mb-2">
                    {event.title}
                  </h3>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8]">
                      <CalendarDays className="w-3.5 h-3.5 text-[#4ad4e4]" />
                      {formatDate(event.started_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8]">
                      <Clock className="w-3.5 h-3.5 text-[#4ad4e4]" />
                      Ends {formatTime(event.ended_at)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-body text-[0.88rem] text-[#1e3a42] dark:text-[#8ecfda] leading-relaxed line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-end text-[0.8rem] text-[#4ad4e4] font-medium gap-1 group-hover:gap-2 transition-all">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loadingYear && !loadingMonth && !error && monthEvents.length === 0 && (
        <div className="text-center py-20">
          <p className="font-body text-[#2e5a6a] dark:text-[#5ba8b8] text-lg">
            No events scheduled for {activeMonth}.
          </p>
          <p className="font-body text-[#4ad4e4] text-sm mt-1">Check back soon!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border border-[rgba(74,212,228,0.3)] text-[#4ad4e4] hover:bg-[#4ad4e4]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#4ad4e4] text-white shadow-sm shadow-[#4ad4e4]/30'
                  : 'border border-[rgba(74,212,228,0.3)] text-[#4ad4e4] hover:bg-[#4ad4e4]/10'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border border-[rgba(74,212,228,0.3)] text-[#4ad4e4] hover:bg-[#4ad4e4]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}