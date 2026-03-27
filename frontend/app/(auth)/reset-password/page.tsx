/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/api/api";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Invalid or expired link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[90vh]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <Image
          src="/login.png"
          alt="background"
          fill
          className="absolute inset-0 w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-[8000ms]"
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 bg-white dark:bg-gray-950 lg:max-w-[520px]">
        <div className="w-full max-w-sm">

          {!token ? (
            /* ── MISSING TOKEN ── */
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400 dark:text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Invalid reset link</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">This link is missing a reset token. Please use the link from your email.</p>
              <Link href="/forgot-password" className="mt-8 inline-flex items-center gap-1.5 text-sm text-[#1ba8b8] dark:text-[#4ad4e4] font-medium hover:text-[#4ad4e4] dark:hover:text-white transition-colors">
                Request a new link →
              </Link>
            </div>

          ) : success ? (
            /* ── SUCCESS STATE ── */
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-[#4ad4e4]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#1ba8b8] dark:text-[#4ad4e4]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Password updated!</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your password has been reset. Redirecting you to sign in…</p>
            </div>

          ) : (
            /* ── FORM STATE ── */
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 bg-[#4ad4e4]/10 text-[#1ba8b8] dark:text-[#4ad4e4] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ad4e4] animate-pulse" />
                  Password reset
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Set a new password</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Choose a strong password you haven&apos;t used before.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                      transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                      bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                      transition-all duration-200"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

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
                      Updating…
                    </span>
                  ) : "Update password"}
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

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}