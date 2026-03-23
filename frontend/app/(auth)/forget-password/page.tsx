"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <Image
          src="/login.png"
          alt="background"
          fill
          className="absolute inset-0 w-full h-full object-cover opacity-50 dark:opacity-30 scale-100 hover:scale-105 transition-transform duration-[8000ms]"
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 bg-white dark:bg-gray-950 lg:max-w-[520px]">
        <div className="w-full max-w-sm">

          {sent ? (
            /* ── SUCCESS STATE ── */
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#4ad4e4]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1ba8b8] dark:text-[#4ad4e4]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Check your inbox</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                If an account exists for <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span>, we've sent a reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-1.5 text-sm text-[#1ba8b8] dark:text-[#4ad4e4] font-medium hover:text-[#4ad4e4] dark:hover:text-white transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 bg-[#4ad4e4]/10 text-[#1ba8b8] dark:text-[#4ad4e4] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ad4e4] animate-pulse" />
                  Password recovery
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Forgot your password?</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                      transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 py-2.5 rounded-xl font-semibold text-sm text-white
                    bg-[#4ad4e4] hover:bg-[#31bfcf] active:scale-[0.98]
                    shadow-[0_4px_20px_rgba(74,212,228,0.4)] hover:shadow-[0_4px_28px_rgba(74,212,228,0.55)]
                    transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </span>
                  ) : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
                Remember it after all?{" "}
                <Link href="/login" className="text-[#1ba8b8] dark:text-[#4ad4e4] font-medium hover:text-[#4ad4e4] dark:hover:text-white transition-colors">
                  Sign in →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}