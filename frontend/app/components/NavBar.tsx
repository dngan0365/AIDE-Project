'use client';

import { useAuth } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Luggage, Map, LogOut, Bot, Globe, Menu, X, MapPin, MessageSquare, User } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/DropdownMenu";

const Navbar = () => {
  const pathName = usePathname();
  const locale = pathName.split('/')[1];
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, loading, isAdmin, logout } = useAuth();
  const isAuthenticated = !!user;

  const pathWithoutLocale = pathName.replace(`/${locale}`, '');

  const handleLanguageChange = (selectedLocale: string) => {
    router.push(`/${selectedLocale}${pathWithoutLocale}`);
  };

  const isActive = (path: string) => pathName === `/${locale}${path}`;

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: <MapPin className="h-5 w-5" /> },
    { href: '/travel',  label: 'Travel',  icon: <Luggage className="h-5 w-5" /> },
    { href: '/forum',   label: 'Forum',   icon: <MessageSquare className="h-5 w-5" /> },
    { href: '/map',     label: 'Map',     icon: <Map className="h-5 w-5" /> },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 px-4 md:px-10 items-center justify-between">

        {/* Logo */}
        <Link href={`/${locale}/`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="Vonders Logo" width={40} height={40} />
          <span className="text-xl font-semibold">Vonders</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className={`flex items-center gap-1.5 px-4 py-5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-[#77DAE6]/5 text-[#4ad4e4]'
                  : 'hover:bg-[#77DAE6]/5 hover:text-[#4ad4e4]'
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
                  <button className="px-4 py-5 hover:text-[#4ad4e4] transition-colors">
                    {user?.avatar_url ? (
                      <div className="relative h-7 w-7 rounded-full overflow-hidden">
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
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/admin/location`}>Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/chat`} className="flex w-full items-center justify-between">
                      <span>Chatbot</span>
                      <Bot className="h-4 w-4" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/settings`}>Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/bookings`}>Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center justify-between"
                    onClick={handleLogout}
                  >
                    <span>Logout</span>
                    <LogOut className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-[#4ad4e4] px-6 py-4 rounded-[50px] text-white hover:bg-[#77DAE6]"
                  asChild
                >
                  <Link href={`/${locale}/auth/register`}>Register</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-4 rounded-[50px] border-[#4ad4e4] hover:bg-[#77DAE6]/10"
                  asChild
                >
                  <Link href={`/${locale}/auth/login`}>Login</Link>
                </Button>
              </>
            )
          )}

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={`/${locale}${link.href}`}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#77DAE6]/10 text-[#4ad4e4]'
                    : 'hover:bg-[#77DAE6]/10 hover:text-[#4ad4e4]'
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