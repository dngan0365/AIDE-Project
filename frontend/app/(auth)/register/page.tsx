/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerUser, loginUser } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { refreshUser } = useAuth();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      await loginUser(form.email, form.password);
      await refreshUser();
      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[92vh]">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <Image
          src="/login.png"
          alt="background"
          fill
          className="absolute inset-0 w-full h-full object-cover object-bottom scale-100 hover:scale-105 transition-transform duration-[8000ms]"
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 bg-white dark:bg-gray-950 lg:max-w-[520px]">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-[#4ad4e4]/10 text-[#1ba8b8] dark:text-[#4ad4e4] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ad4e4] animate-pulse" />
              Get started
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Fill in your details to join in just a few seconds.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              <input
                value={form.name}
                onChange={set("name")}
                placeholder="Jane Smith"
                required
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                  transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                required
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                  transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                required
                minLength={6}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ad4e4]/50 focus:border-[#4ad4e4]
                  transition-all duration-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
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
                  Creating account…
                </span>
              ) : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-600">or</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Login link */}
          <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1ba8b8] dark:text-[#4ad4e4] font-medium hover:text-[#4ad4e4] dark:hover:text-white transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}