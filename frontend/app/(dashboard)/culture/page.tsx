/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listStories, Story, StoryFilters } from "@/api/story";

const COUNTRIES = ["All", "Vietnam", "Thailand", "Myanmar", "Cambodia", "Indonesia", "Philippines", "Malaysia", "Laos", "Singapore", "Brunei", "Timor-Leste"];
const CULTURE_TYPES = ["All", "mythology", "tradition", "history", "cuisine", "art", "festival"];

export default function CulturePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCountry, setActiveCountry] = useState("All");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    setLoading(true);
    const f: StoryFilters = {};
    if (activeCountry !== "All") f.country = activeCountry;
    if (activeType !== "All") f.culture_type = activeType;
    if (search) f.title = search;
    listStories(f)
      .then(setStories)
      .finally(() => setLoading(false));
  }, [activeCountry, activeType, search]);

  const difficultyColor = (d: string) => {
    if (d === "easy")
      return "text-emerald-600 border-emerald-300 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700/50 dark:bg-emerald-900/30";
    if (d === "medium")
      return "text-amber-600 border-amber-300 bg-amber-50 dark:text-amber-400 dark:border-amber-700/50 dark:bg-amber-900/30";
    return "text-red-600 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-700/50 dark:bg-red-900/30";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white font-['Crimson_Text'] transition-colors duration-300">

      {/* Background — visible only in dark mode */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0d1f24_0%,_#0a0a0f_60%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ad4e4]/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4ad4e4]/4 blur-[120px] rounded-full" />
      </div>

      {/* Light mode subtle background */}
      <div className="fixed inset-0 pointer-events-none dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e8fafb_0%,_#ffffff_60%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4ad4e4]/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* Hero Header */}
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <p className="font-['Cinzel'] text-xs tracking-[0.4em] text-[#4ad4e4]/70 dark:text-[#4ad4e4]/60 mb-3">
            EXPLORE THE WORLD
          </p>
          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl font-bold leading-tight mb-4 text-gray-900 dark:text-white">
            <span>Cultural&nbsp;</span>
            <span className="text-[#4ad4e4]">Stories</span>
          </h1>
          <p className="text-gray-500 dark:text-white/50 text-base sm:text-lg leading-relaxed">
            Journey through civilizations, myths, and traditions from across the ages.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4ad4e4]/60">✦</span>
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#13121a] border border-[#4ad4e4]/25 dark:border-[#4ad4e4]/20 rounded-xl pl-10 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 focus:outline-none focus:border-[#4ad4e4]/70 dark:focus:border-[#4ad4e4]/50 transition-colors shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 sm:mb-10 space-y-3 sm:space-y-4">
          {/* Region filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-['Cinzel'] text-xs tracking-widest text-gray-400 dark:text-white/30 mr-1 shrink-0">
              REGION
            </span>
            {COUNTRIES.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCountry(c)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-['Cinzel'] tracking-wider transition-all ${
                  activeCountry === c
                    ? "bg-[#4ad4e4] text-white dark:text-black shadow-md"
                    : "border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-[#4ad4e4]/50 hover:text-[#4ad4e4] dark:hover:border-[#4ad4e4]/30 dark:hover:text-white/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-['Cinzel'] text-xs tracking-widest text-gray-400 dark:text-white/30 mr-1 shrink-0">
              TYPE
            </span>
            {CULTURE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm capitalize transition-all ${
                  activeType === t
                    ? "bg-[#77DAE6] dark:bg-[#77DAE6]/80 text-white dark:text-black border border-[#77DAE6] shadow-md"
                    : "border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:border-[#77DAE6]/50 hover:text-[#4ad4e4] dark:hover:border-[#77DAE6]/40 dark:hover:text-white/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-[#4ad4e4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-['Cinzel'] text-gray-300 dark:text-white/20 text-lg">No stories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {stories.map((story, i) => (
              <Link key={story.id} href={`/culture/${story.id}`}>
                <article
                  className="group relative bg-white dark:bg-[#13121a] border border-gray-100 dark:border-[#4ad4e4]/10 rounded-2xl overflow-hidden hover:border-[#4ad4e4]/50 dark:hover:border-[#4ad4e4]/40 transition-all duration-500 cursor-pointer h-full shadow-sm hover:shadow-[0_4px_24px_rgba(74,212,228,0.12)] dark:shadow-none dark:hover:shadow-[0_4px_32px_rgba(74,212,228,0.08)]"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Cover image */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-50 dark:bg-[#1e1d2a]">
                    {story.cover_image_url ? (
                      <img
                        src={story.cover_image_url}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">🗺</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[#13121a] via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-['Cinzel'] tracking-wider ${difficultyColor(
                          String(story.difficulty)
                        )}`}
                      >
                        {story.difficulty}
                      </span>
                      {!story.is_published && (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-gray-300 dark:border-white/20 text-gray-400 dark:text-white/40 font-['Cinzel'] bg-white/60 dark:bg-transparent">
                          DRAFT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-[#4ad4e4]/80 dark:text-[#4ad4e4]/60 font-['Cinzel'] tracking-wider capitalize">
                        {story.culture_type}
                      </span>
                      <span className="text-gray-300 dark:text-white/20">·</span>
                      <span className="text-xs text-gray-400 dark:text-white/30">{story.country}</span>
                    </div>
                    <h2 className="font-['Cinzel'] text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#4ad4e4] transition-colors leading-snug">
                      {story.title}
                    </h2>
                    <p className="text-gray-500 dark:text-white/50 text-sm leading-relaxed line-clamp-2 mb-4 sm:mb-5">
                      {story.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 dark:text-white/30 text-xs">⏱ {story.estimated_time}</span>
                      <span className="text-[#4ad4e4] text-xs font-['Cinzel'] tracking-wider group-hover:translate-x-1 transition-transform inline-block">
                        BEGIN →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}