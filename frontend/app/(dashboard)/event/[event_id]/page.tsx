/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  Share2,
  BookOpen,
  File,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { getEvent, getTimeline, type Event } from '@/api/event'; // adjust path as needed

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDateLong(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}



function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

function getDurationLabel(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours >= 1) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return 'Less than 1 hr';
}

function isOngoing(start: string, end: string): boolean {
  const now = Date.now();
  return new Date(start).getTime() <= now && now <= new Date(end).getTime();
}

function isUpcoming(start: string): boolean {
  return new Date(start).getTime() > Date.now();
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ started_at, ended_at }: { started_at: string; ended_at: string }) {
  if (isOngoing(started_at, ended_at)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Happening Now
      </span>
    );
  }
  if (isUpcoming(started_at)) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#4ad4e4]/15 text-[#2ab8cc] dark:bg-[#4ad4e4]/20 dark:text-[#4ad4e4]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#4ad4e4]" />
        Upcoming
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      Past Event
    </span>
  );
}

function TimelineStrip({ events, activeId }: { events: Event[]; activeId: string }) {
  if (events.length === 0) return null;
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4ad4e4]/80 via-[#4ad4e4]/30 to-transparent" />

      <ul className="space-y-1 pl-7">
        {events.map((ev) => {
          const active = ev.id === activeId;
          return (
            <li key={ev.id} className="relative">
              {/* Dot */}
              <span
                className={`absolute -left-7 top-[6px] w-[14px] h-[14px] rounded-full border-2 transition-all ${
                  active
                    ? 'border-[#4ad4e4] bg-[#4ad4e4] scale-125'
                    : 'border-[#4ad4e4]/40 bg-white dark:bg-[#071318]'
                }`}
              />
              <Link
                href={`/events/${ev.id}`}
                className={`group flex flex-col gap-0.5 rounded-xl px-3 py-2 transition-all ${
                  active
                    ? 'bg-[#4ad4e4]/10 dark:bg-[#4ad4e4]/10'
                    : 'hover:bg-[#f0fbfc] dark:hover:bg-[#0d2b33]'
                }`}
              >
                <span
                  className={`text-[0.82rem] font-semibold leading-snug line-clamp-1 transition-colors ${
                    active
                      ? 'text-[#4ad4e4]'
                      : 'text-[#0e1f24] dark:text-[#d4f1f5] group-hover:text-[#4ad4e4]'
                  }`}
                >
                  {ev.title}
                </span>
                <span className="text-[0.72rem] text-[#2e5a6a] dark:text-[#5ba8b8]">
                  {formatDateShort(ev.started_at)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
function downloadICS(event: Event) {
  const start = new Date(event.started_at).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end = new Date(event.ended_at).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR
  `.trim();

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title}.ics`;
  a.click();

  URL.revokeObjectURL(url);
}

function openGoogleCalendar(event: Event) {
  const format = (d: string) =>
    new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${format(event.started_at)}/${format(event.ended_at)}`,
    details: event.description,
  });

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;

  window.open(url, "_blank");
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { event_id } = useParams<{ event_id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [timeline, setTimeline] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event_id) return;
    setLoading(true);
    setError(null);

    getEvent(event_id)
      .then((ev) => {
        setEvent(ev);
        // Fetch sibling events from same story for timeline sidebar
        return getTimeline(ev.story_id).then(setTimeline);
      })
      .catch(() => setError('Event not found or failed to load.'))
      .finally(() => setLoading(false));
  }, [event_id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          {/* Hero skeleton */}
          <div className="rounded-3xl overflow-hidden h-[38vh] bg-[#e0f7fa] dark:bg-[#0d2b33]" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 mt-8">
            <div className="space-y-4">
              <div className="h-6 w-24 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded-full" />
              <div className="h-10 w-3/4 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded-xl" />
              <div className="h-4 w-full bg-[#e0f7fa] dark:bg-[#0d2b33] rounded" />
              <div className="h-4 w-5/6 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded" />
            </div>
            <div className="h-64 bg-[#e0f7fa] dark:bg-[#0d2b33] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-lg font-semibold text-[#0e1f24] dark:text-[#d4f1f5] mb-2">
          {error ?? 'Event not found'}
        </p>
        <p className="text-sm text-[#2e5a6a] dark:text-[#5ba8b8] mb-6">
          The event may have been removed or the link is invalid.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(74,212,228,0.4)] text-[#4ad4e4] hover:bg-[#4ad4e4]/10 text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const ongoing = isOngoing(event.started_at, event.ended_at);
  const upcoming = isUpcoming(event.started_at);
  const duration = getDurationLabel(event.started_at, event.ended_at);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Back nav ── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[#2e5a6a] dark:text-[#5ba8b8] hover:text-[#4ad4e4] dark:hover:text-[#4ad4e4] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* ── Hero image ── */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#071318] mb-10" style={{ height: 'clamp(220px, 38vh, 480px)' }}>
        {event.img_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.img_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0d2b33] via-[#071318] to-[#040d10]">
            <CalendarDays className="w-16 h-16 text-[#4ad4e4]/20" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Floating status badge */}
        <div className="absolute top-5 left-5">
          <StatusBadge started_at={event.started_at} ended_at={event.ended_at} />
        </div>

        {/* Share button */}
        <div className="absolute top-5 right-5 flex items-center gap-2">

          {/* Download ICS */}
          <button
            aria-label="Download .ics file"
            onClick={() => downloadICS(event)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#4ad4e4]/20 border border-[#4ad4e4]/40 text-[#4ad4e4] hover:bg-[#4ad4e4]/30 transition-all"
          >
            <File className="w-4 h-4" />
          </button>

          {/* Google Calendar */}
          <button
            aria-label="Add to Google Calendar"
            onClick={() => openGoogleCalendar(event)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#4ad4e4]/20 border border-[#4ad4e4]/40 text-[#4ad4e4] hover:bg-[#4ad4e4]/30 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Share"}
          </button>

        </div>

        {/* Bottom-left title overlay on hero */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display font-black text-white text-[clamp(1.5rem,4vw,2.8rem)] leading-tight drop-shadow-md line-clamp-2">
            {event.title}
          </h1>
        </div>
      </div>

      {/* ── Main layout: content + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

        {/* ── Left: main content ── */}
        <div className="space-y-8 min-w-0">

          {/* Date / time info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Start */}
            <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-4">
              <p className="text-[0.68rem] uppercase tracking-widest text-[#4ad4e4] font-semibold mb-1">Starts</p>
              <p className="text-[0.85rem] font-bold text-[#0e1f24] dark:text-[#d4f1f5] leading-snug">
                {formatDateLong(event.started_at)}
              </p>
              <p className="text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8] mt-0.5">
                {formatTime(event.started_at)}
              </p>
            </div>

            {/* End */}
            <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-4">
              <p className="text-[0.68rem] uppercase tracking-widest text-[#4ad4e4] font-semibold mb-1">Ends</p>
              <p className="text-[0.85rem] font-bold text-[#0e1f24] dark:text-[#d4f1f5] leading-snug">
                {formatDateLong(event.ended_at)}
              </p>
              <p className="text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8] mt-0.5">
                {formatTime(event.ended_at)}
              </p>
            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-4 col-span-2 sm:col-span-1">
              <p className="text-[0.68rem] uppercase tracking-widest text-[#4ad4e4] font-semibold mb-1">Duration</p>
              <p className="text-[0.85rem] font-bold text-[#0e1f24] dark:text-[#d4f1f5]">{duration}</p>
              <p className="text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8] mt-0.5">
                {ongoing ? 'In progress' : upcoming ? 'Not started yet' : 'Completed'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display font-bold text-[1.1rem] text-[#0e1f24] dark:text-[#d4f1f5] mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4ad4e4]" />
              About this Event
            </h2>
            <p className="font-body text-[0.95rem] leading-relaxed text-[#1e3a42] dark:text-[#8ecfda] whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Story link */}
          {event.story_id && (
            <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-widest text-[#4ad4e4] font-semibold mb-0.5">Part of a Story</p>
                <p className="text-sm text-[#1e3a42] dark:text-[#8ecfda]">
                  This event belongs to a larger story timeline.
                </p>
              </div>
              <Link
                href={`/stories/${event.story_id}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[rgba(74,212,228,0.4)] text-[#4ad4e4] text-sm font-medium hover:bg-[#4ad4e4]/10 transition-colors"
              >
                View Story
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="space-y-6">

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-5">
              <h3 className="text-[0.68rem] uppercase tracking-widest text-[#4ad4e4] font-semibold mb-4">
                Story Timeline
              </h3>
              <TimelineStrip events={timeline} activeId={event.id} />
            </div>
          )}

          {/* Quick info card */}
          <div className="rounded-2xl border border-[rgba(74,212,228,0.2)] bg-[#f0fbfc] dark:bg-[#0a1e24] p-5 space-y-3">
            <h3 className="text-[0.68rem] uppercase tracking-widest text-[#4ad4e4] font-semibold">
              Quick Info
            </h3>
            <div className="divide-y divide-[rgba(74,212,228,0.12)]">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.8rem] text-[#2e5a6a] dark:text-[#5ba8b8] flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#4ad4e4]" />
                  Start date
                </span>
                <span className="text-[0.8rem] font-medium text-[#0e1f24] dark:text-[#d4f1f5]">
                  {formatDateShort(event.started_at)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.8rem] text-[#2e5a6a] dark:text-[#5ba8b8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4ad4e4]" />
                  End date
                </span>
                <span className="text-[0.8rem] font-medium text-[#0e1f24] dark:text-[#d4f1f5]">
                  {formatDateShort(event.ended_at)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.8rem] text-[#2e5a6a] dark:text-[#5ba8b8]">Duration</span>
                <span className="text-[0.8rem] font-medium text-[#0e1f24] dark:text-[#d4f1f5]">{duration}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[0.8rem] text-[#2e5a6a] dark:text-[#5ba8b8]">Status</span>
                <StatusBadge started_at={event.started_at} ended_at={event.ended_at} />
              </div>
            </div>
          </div>

          {/* Share CTA */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-[rgba(74,212,228,0.4)] text-[#4ad4e4] font-medium text-sm hover:bg-[#4ad4e4]/10 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Link copied!' : 'Share this event'}
          </button>
        </aside>
      </div>
    </div>
  );
}