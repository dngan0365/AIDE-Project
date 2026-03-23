'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Event {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  country: string;
  category: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_EVENTS: Record<string, Event[]> = {
  Jan: [
    {
      id: 1,
      name: "Tết Nguyên Đán — Lunar New Year",
      description: "Vietnam's most important festival, celebrating the arrival of spring and the new lunar year with family reunions, fireworks, and traditional customs.",
      coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
      startDate: "2025-01-29T08:00:00",
      endDate: "2025-02-04T23:59:00",
      country: "🇻🇳 Vietnam",
      category: "Cultural",
    },
    {
      id: 2,
      name: "Chiang Mai Flower Festival",
      description: "A stunning celebration of northern Thailand's blooming season featuring elaborate floral floats, beauty pageants, and cultural performances.",
      coverImage: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=600&q=80",
      startDate: "2025-01-31T09:00:00",
      endDate: "2025-02-02T20:00:00",
      country: "🇹🇭 Thailand",
      category: "Festival",
    },
    {
      id: 3,
      name: "Singapore Art Week",
      description: "Southeast Asia's premier visual arts event showcasing over 130 art events across galleries, museums, and public spaces island-wide.",
      coverImage: "https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&q=80",
      startDate: "2025-01-17T10:00:00",
      endDate: "2025-01-26T22:00:00",
      country: "🇸🇬 Singapore",
      category: "Art",
    },
    {
      id: 4,
      name: "Ubud Writers & Readers Festival",
      description: "Bringing together extraordinary writers and thinkers from around the world to the spiritual heart of Bali.",
      coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80",
      startDate: "2025-01-22T08:00:00",
      endDate: "2025-01-26T18:00:00",
      country: "🇮🇩 Indonesia",
      category: "Literature",
    },
    {
      id: 5,
      name: "Kuala Lumpur Fashion Week",
      description: "Malaysia's biggest fashion event showcasing local and regional designers on the international stage.",
      coverImage: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
      startDate: "2025-01-20T10:00:00",
      endDate: "2025-01-24T21:00:00",
      country: "🇲🇾 Malaysia",
      category: "Fashion",
    },
    {
      id: 6,
      name: "Pahiyas Festival Preparations",
      description: "Communities across Lucban begin the vibrant preparations for the thanksgiving harvest festival honoring San Isidro Labrador.",
      coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
      startDate: "2025-01-10T06:00:00",
      endDate: "2025-01-10T20:00:00",
      country: "🇵🇭 Philippines",
      category: "Cultural",
    },
  ],
  Feb: [
    {
      id: 7,
      name: "Hội An Lantern Festival",
      description: "Every full moon, Hoi An's Ancient Town transforms into a dreamscape of silk lanterns and floating candles on the Thu Bon River.",
      coverImage: "https://images.unsplash.com/photo-1569523758965-95e6e91f0e8d?w=600&q=80",
      startDate: "2025-02-12T18:00:00",
      endDate: "2025-02-12T23:00:00",
      country: "🇻🇳 Vietnam",
      category: "Cultural",
    },
    {
      id: 8,
      name: "Bangkok International Film Festival",
      description: "Celebrating cinematic excellence from Asia and the world, screening over 200 films across Bangkok's premier venues.",
      coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80",
      startDate: "2025-02-20T10:00:00",
      endDate: "2025-02-28T22:00:00",
      country: "🇹🇭 Thailand",
      category: "Film",
    },
    {
      id: 9,
      name: "Bali Spirit Festival",
      description: "An annual yoga, dance, and world music festival set amid the sacred landscape of Ubud, drawing wellness seekers worldwide.",
      coverImage: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80",
      startDate: "2025-02-26T07:00:00",
      endDate: "2025-03-02T20:00:00",
      country: "🇮🇩 Indonesia",
      category: "Wellness",
    },
  ],
  Mar: [
    {
      id: 10,
      name: "Hue Festival",
      description: "A biennial celebration of Vietnam's imperial heritage featuring royal court music, traditional theatre, and spectacular night performances.",
      coverImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=80",
      startDate: "2025-03-22T08:00:00",
      endDate: "2025-03-28T23:00:00",
      country: "🇻🇳 Vietnam",
      category: "Heritage",
    },
    {
      id: 11,
      name: "Songkran Water Festival Preview",
      description: "Early celebrations of Thailand's traditional New Year water festival in Chiang Mai, the most festive city for Songkran.",
      coverImage: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&q=80",
      startDate: "2025-03-30T10:00:00",
      endDate: "2025-04-15T22:00:00",
      country: "🇹🇭 Thailand",
      category: "Festival",
    },
    {
      id: 12,
      name: "Singapore Food Festival",
      description: "A month-long gastronomic celebration showcasing Singapore's diverse hawker culture and world-class culinary talent.",
      coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
      startDate: "2025-03-14T11:00:00",
      endDate: "2025-03-30T22:00:00",
      country: "🇸🇬 Singapore",
      category: "Food",
    },
  ],
};

// Fill remaining months with placeholder events
const PLACEHOLDER_EVENTS: Event[] = [
  {
    id: 99,
    name: "ASEAN Cultural Exchange",
    description: "An inter-regional celebration of Southeast Asian arts, crafts, and traditions bringing together all 10 ASEAN nations.",
    coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
    startDate: "2025-06-15T09:00:00",
    endDate: "2025-06-20T21:00:00",
    country: "🌏 ASEAN",
    category: "Cultural",
  },
];

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

// ── Component ──────────────────────────────────────────────────────────────
export default function DashboardEvent() {
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [currentPage, setCurrentPage] = useState(1);

  const allEvents = MOCK_EVENTS[activeMonth] ?? PLACEHOLDER_EVENTS;
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = allEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleMonthChange = (month: string) => {
    setActiveMonth(month);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

      {/* ── Header ── */}
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

      {/* ── Month Selector ── */}
      <div className="bg-[#f0fbfc] dark:bg-[#071318] border border-[rgba(74,212,228,0.2)] rounded-2xl p-5 mb-10">
        {/* Month buttons */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {MONTHS.map((month) => {
            const hasEvents = !!MOCK_EVENTS[month]?.length;
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
          {MONTHS.map((month) => (
            <button
            aria-label='Button'
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

      {/* ── Month Label ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-[1.4rem] text-[#0e1f24] dark:text-[#d4f1f5]">
          {activeMonth} Events
          <span className="ml-3 font-body font-normal text-sm text-[#4ad4e4]">
            {allEvents.length} {allEvents.length === 1 ? 'event' : 'events'}
          </span>
        </h2>
      </div>

      {/* ── Events Grid ── */}
      {paginatedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((event, i) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group block bg-white dark:bg-[#0a1e24] rounded-2xl overflow-hidden border border-[rgba(74,212,228,0.15)] dark:border-[rgba(74,212,228,0.1)] shadow-sm hover:shadow-[0_8px_30px_rgba(74,212,228,0.15)] dark:hover:shadow-[0_8px_30px_rgba(74,212,228,0.12)] transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Cover image */}
              <div className="relative h-52 overflow-hidden bg-[#071318]">
                <Image
                  src={event.coverImage}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Category pill */}
                <span className={`absolute top-3 left-3 text-[0.65rem] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full ${CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.Cultural}`}>
                  {event.category}
                </span>
                {/* Country badge */}
                <span className="absolute bottom-3 left-3 text-[0.75rem] text-white/90 font-body">
                  {event.country}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-[1.05rem] leading-snug text-[#0e1f24] dark:text-[#d4f1f5] group-hover:text-[#4ad4e4] dark:group-hover:text-[#4ad4e4] transition-colors line-clamp-2 mb-2">
                  {event.name}
                </h3>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8]">
                    <CalendarDays className="w-3.5 h-3.5 text-[#4ad4e4]" />
                    {formatDate(event.startDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[#2e5a6a] dark:text-[#5ba8b8]">
                    <Clock className="w-3.5 h-3.5 text-[#4ad4e4]" />
                    Ends {formatTime(event.endDate)}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="font-body text-[0.88rem] text-[#1e3a42] dark:text-[#8ecfda] leading-relaxed line-clamp-2 mb-4"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />

                {/* CTA */}
                <div className="flex items-center justify-end text-[0.8rem] text-[#4ad4e4] font-medium gap-1 group-hover:gap-2 transition-all">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-body text-[#2e5a6a] dark:text-[#5ba8b8] text-lg">
            No events scheduled for {activeMonth}.
          </p>
          <p className="font-body text-[#4ad4e4] text-sm mt-1">Check back soon!</p>
        </div>
      )}

      {/* ── Pagination ── */}
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