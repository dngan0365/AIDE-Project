'use client';

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Luggage, Map, LogOut, Bot, Globe, Menu, X, MapPin, MessageSquare, User, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const Navbar = () => {
  const pathName = usePathname();
  const locale = pathName.split('/')[1];
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, loading, isAdmin, logout } = useAuth();
  const isAuthenticated = !!user;

  const isActive = (path: string) => pathName === `/${locale}${path}`;

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { href: '/culture',  label: 'Culture',  icon: <MapPin className="h-5 w-5" /> },
    { href: '/explore',  label: 'Explore',  icon: <Globe className="h-5 w-5" /> },
    { href: '/events',   label: 'Events',   icon: <CalendarHeart className="h-5 w-5" /> },
    { href: '/map',      label: 'Map',      icon: <Map className="h-5 w-5" /> },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-[#4ad4e4]/20 bg-white/95 dark:bg-[#050f12]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#050f12]/60">
      <div className="flex h-16 px-4 md:px-10 items-center justify-between">

        {/* Logo */}
        <Link href={`/${locale}/`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Image src="/logo_svg.svg" alt="AIASEAN Logo" width={40} height={40} />
          <span className="text-xl font-semibold text-[#4ad4e4]">AIASEAN</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className={`flex items-center gap-1.5 px-4 py-5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-[#4ad4e4]/10 text-[#4ad4e4] border-b-2 border-[#4ad4e4]'
                  : 'text-gray-600 dark:text-[#8ecfda] hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4]'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-1">

          {/* Auth Section */}
          {!loading && (
            isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-5 text-gray-500 dark:text-[#8ecfda] hover:text-[#4ad4e4] dark:hover:text-[#4ad4e4] transition-colors">
                    {user?.avatar_url ? (
                      <div className="relative h-7 w-7 rounded-full overflow-hidden ring-2 ring-[#4ad4e4]/40">
                        <Image
                          src={user.avatar_url}
                          alt={user.name || "Profile"}
                          fill
                          priority
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-[#4ad4e4]/20 bg-white dark:bg-[#0a1e24] dark:text-[#d4f1f5]">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href={`/admin`} className="dark:text-[#d4f1f5] dark:focus:bg-[#4ad4e4]/10">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/chat`} className="flex w-full items-center justify-between dark:text-[#d4f1f5] dark:focus:bg-[#4ad4e4]/10">
                      <span>Chatbot</span>
                      <Bot className="h-4 w-4 text-[#4ad4e4]" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile`} className="flex w-full items-center justify-between dark:text-[#d4f1f5] dark:focus:bg-[#4ad4e4]/10">
                      <span>Profile</span>
                      <User className="h-4 w-4 text-[#4ad4e4]" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#4ad4e4]/20" />
                  <DropdownMenuItem asChild onClick={handleLogout}>
                    <div className="flex w-full items-center justify-between text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 dark:focus:bg-red-500/10">
                      <span>Logout</span>
                      <LogOut className="h-4 w-4" />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-[#4ad4e4] px-6 py-4 rounded-[50px] text-white hover:bg-[#77DAE6] transition-colors shadow-sm shadow-[#4ad4e4]/30"
                  asChild
                >
                  <Link href="/register">Register</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-4 rounded-[50px] border-[#4ad4e4] text-[#4ad4e4] hover:bg-[#4ad4e4]/10 dark:border-[#4ad4e4]/70 dark:text-[#4ad4e4] dark:hover:bg-[#4ad4e4]/10 transition-colors"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )
          )}

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full text-gray-500 dark:text-[#8ecfda] hover:text-[#4ad4e4] hover:bg-[#4ad4e4]/10 dark:hover:text-[#4ad4e4] dark:hover:bg-[#4ad4e4]/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#4ad4e4]/20 py-4 px-6 bg-white/95 dark:bg-[#050f12]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#050f12]/60">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#4ad4e4]/10 text-[#4ad4e4] border-l-2 border-[#4ad4e4]'
                    : 'text-gray-600 dark:text-[#8ecfda] hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4] dark:hover:text-[#4ad4e4]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;