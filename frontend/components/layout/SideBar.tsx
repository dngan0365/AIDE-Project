"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, BarChart3, Users, FileText, Film, CircleCheckBig, CalendarCheck2 } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/story", label: "Story", icon: FileText, exact: false },
  { href: "/admin/scene", label: "Scene", icon: Film, exact: false },
  { href: "/admin/challenge", label: "Challenge", icon: CircleCheckBig, exact: false },
  { href: "/admin/event", label: "Event", icon: CalendarCheck2, exact: false }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 sm:w-60 min-h-screen bg-[#f5feff] dark:bg-[#0a0c11] border-r border-black/10 dark:border-[#1e2130] flex flex-col sticky top-0 h-screen transition-colors duration-300">
      {/* Logo */}
      <div className="px-4 sm:px-6 py-5 sm:py-7 border-b border-black/10 dark:border-[#1e2130]">
        <div
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-base sm:text-lg font-800 text-primary tracking-tight leading-none"
        >
          ADMIN
        </div>
        <div className="text-[10px] text-black/30 dark:text-[#4a5060] mt-1 tracking-widest uppercase">
          Control Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 sm:px-3 py-4 sm:py-5 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded text-xs sm:text-sm transition-all duration-150 group ${
                active
                  ? "bg-[#4ad4e4]/10 text-primary border border-[#4ad4e4]/25"
                  : "text-black/40 dark:text-[#6b7280] hover:text-black/80 dark:hover:text-[#e8e6e1] hover:bg-black/5 dark:hover:bg-[#1a1d2a] border border-transparent"
              }`}
            >
              <Icon
                size={14}
                className={`sm:w-[15px] sm:h-[15px] ${
                  active
                    ? "text-[#4ad4e4]"
                    : "text-black/25 dark:text-[#4a5060] group-hover:text-black/50 dark:group-hover:text-[#9ca3af]"
                }`}
              />
              <span className="tracking-wide">{label}</span>
              {active && (
                <span className="ml-auto w-1 h-1 rounded-full bg-[#4ad4e4]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-black/10 dark:border-[#1e2130]">
        <div className="text-[10px] text-black/15 dark:text-[#2a2f3d] tracking-widest uppercase">v1.0.0</div>
      </div>
    </aside>
  );
}