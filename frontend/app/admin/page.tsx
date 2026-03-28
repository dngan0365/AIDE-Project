"use client";

import { useEffect, useState } from "react";
import { listStories } from "@/api/story";
import { listCharacters } from "@/api/character";
import { BookOpen, Users, Layers, Zap, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [storiesCount, setStoriesCount] = useState<number | null>(null);
  const [charactersCount, setCharactersCount] = useState<number | null>(null);

  useEffect(() => {
    listStories().then((d) => setStoriesCount(d.length)).catch(() => setStoriesCount(0));
    listCharacters().then((d) => setCharactersCount(d.length)).catch(() => setCharactersCount(0));
  }, []);

  const cards = [
    {
      label: "Stories",
      count: storiesCount,
      icon: BookOpen,
      href: "/admin/story",
      color: "from-[#4ad4e4]/20 to-[#4ad4e4]/5",
      border: "border-[#4ad4e4]/25 dark:border-[#4ad4e4]/20",
      accent: "text-[#4ad4e4]",
    },
    {
      label: "Characters",
      count: charactersCount,
      icon: Users,
      href: "/admin/character",
      color: "from-[#77DAE6]/20 to-[#77DAE6]/5",
      border: "border-[#77DAE6]/25 dark:border-[#77DAE6]/20",
      accent: "text-[#77DAE6]",
    },
    {
      label: "Scenes",
      count: null,
      icon: Layers,
      href: "/admin/scene",
      color: "from-[#4ad4e4]/15 to-[#4ad4e4]/5",
      border: "border-[#4ad4e4]/20",
      accent: "text-[#4ad4e4]",
    },
    {
      label: "Challenges",
      count: null,
      icon: Zap,
      href: "/admin/challenge",
      color: "from-[#77DAE6]/15 to-[#77DAE6]/5",
      border: "border-[#77DAE6]/20",
      accent: "text-[#77DAE6]",
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-2 text-black/30 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
          <TrendingUp size={12} />
          <span>Overview</span>
        </div>
        <h1
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-2xl sm:text-3xl font-bold text-black dark:text-[#e8e6e1]"
        >
          Dashboard
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {cards.map(({ label, count, icon: Icon, href, color, border, accent }) => (
          <Link
            key={label}
            href={href}
            className={`relative rounded-lg border ${border} bg-gradient-to-b ${color} p-4 sm:p-5 hover:scale-[1.02] transition-transform duration-150 cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${accent}`} />
              <span className="text-[10px] text-black/30 dark:text-[#4a5060] tracking-widest uppercase group-hover:text-black/50 dark:group-hover:text-[#6b7280] transition-colors hidden xs:block">
                View →
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-semibold ${accent} mb-1`}>
              {count === null ? "—" : count}
            </div>
            <div className="text-xs text-black/40 dark:text-[#6b7280] tracking-wide">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="border border-black/10 dark:border-[#1e2130] rounded-lg p-4 sm:p-6">
        <div className="text-xs text-black/30 dark:text-[#4a5060] tracking-widest uppercase mb-3 sm:mb-4">
          Quick Actions
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            { label: "+ New Story", href: "/admin/story?action=new" },
            { label: "+ New Character", href: "/admin/character?action=new" },
            { label: "+ New Scene", href: "/admin/scene?action=new" },
            { label: "+ New Challenge", href: "/admin/challenge?action=new" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs sm:text-sm text-black/50 dark:text-[#6b7280] hover:text-[#4ad4e4] border border-black/10 dark:border-[#1e2130] hover:border-[#4ad4e4]/40 rounded px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-150 tracking-wide"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}