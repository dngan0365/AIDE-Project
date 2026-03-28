/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  getMe,
  getUserProgress,
  getUserChallengeProgress,
  updateProfile,
  UserProfile,
  UserProgress,
  UserChallengeProgress,
} from "@/api/user";
import { uploadImage } from "@/api/upload";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [challenges, setChallenges] = useState<UserChallengeProgress[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    avatar_url: "",
    preferred_language: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Avatar click → trigger file picker (only in edit mode) ──
  const handleAvatarClick = () => {
    if (editing) fileInputRef.current?.click();
  };

  // ── File selected → upload immediately, update form.avatar_url ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, avatar_url: url }));
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Initial data fetch ──
  useEffect(() => {
    Promise.all([getMe(), getUserProgress(), getUserChallengeProgress()])
      .then(([p, prog, chall]) => {
        setProfile(p);
        setProgress(prog);
        setChallenges(chall);
        setForm({
          name: p.name,
          avatar_url: p.avatar_url,
          preferred_language: p.preferred_language,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Save profile (send full form including latest avatar_url) ──
  const handleSave = async () => {
    if (uploading) return; // guard: don't save while upload is still in flight
    try {
      setSaving(true);
      const updated = await updateProfile(form);
      setProfile(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel editing → restore form from current profile ──
  const handleCancel = () => {
    if (!profile) return;
    setForm({
      name: profile.name,
      avatar_url: profile.avatar_url,
      preferred_language: profile.preferred_language,
    });
    setEditing(false);
  };

  const totalXP = progress.reduce((sum, p) => sum + p.xp_earned, 0);
  const completedStories = progress.filter((p) => p.status === "completed").length;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-primary text-sm tracking-widest">LOADING PROFILE</p>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white transition-colors">
      {/* Decorative background (dark mode only) */}
      <div className="fixed inset-0 pointer-events-none hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1025_0%,_#0a0a0f_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] text-primary/60 mb-2">YOUR JOURNEY</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── LEFT COLUMN ── */}
          <div>
            <div className="bg-gray-50 dark:bg-[#13121a] border border-gray-200 dark:border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center gap-6">

              {/* Avatar */}
              <div
                className="relative cursor-pointer"
                onClick={handleAvatarClick}
                title={editing ? "Change avatar" : undefined}
              >
                {/* Circle */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/40">
                  {form.avatar_url ? (
                    <img
                      src={form.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
                      {profile?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  aria-label="Upload new avatar image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Upload overlay (edit mode) */}
                {editing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs rounded-full transition-opacity">
                    {uploading ? "Uploading..." : "Upload"}
                  </div>
                )}

                {/* Badge — stays inside the relative wrapper */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-black text-xs font-bold pointer-events-none">
                  ✦
                </div>
              </div>

              {/* View mode */}
              {!editing ? (
                <>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">{profile?.name}</h2>
                    <p className="text-primary/70 text-sm mt-1">{profile?.preferred_language}</p>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-2.5 border border-primary/40 rounded-xl text-primary text-xs tracking-widest hover:bg-primary/10 transition"
                  >
                    EDIT PROFILE
                  </button>
                </>
              ) : (
                /* Edit mode */
                <div className="w-full space-y-3 text-left">
                  {(["name", "avatar_url", "preferred_language"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-xs text-primary/70 tracking-wider uppercase">
                        {field.replace(/_/g, " ")}
                      </label>
                      <input
                        aria-label={`Profile edit input for ${field}`}
                        className="mt-1 w-full bg-white dark:bg-[#0a0a0f] border border-gray-300 dark:border-primary/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      />
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <button
                      aria-label="Cancel profile edit"
                      onClick={handleCancel}
                      disabled={saving || uploading}
                      className="flex-1 py-2 border border-gray-300 dark:border-white/20 rounded-lg text-gray-500 dark:text-white/50 text-xs hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                    >
                      CANCEL
                    </button>
                    <button
                      aria-label="Save profile changes"
                      onClick={handleSave}
                      disabled={saving || uploading}
                      className="flex-1 py-2 bg-primary rounded-lg text-black text-xs font-bold hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {uploading ? "UPLOADING..." : saving ? "SAVING..." : "SAVE"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {[
                { label: "TOTAL XP", value: totalXP },
                { label: "COMPLETED", value: completedStories },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-gray-50 dark:bg-[#13121a] border border-gray-200 dark:border-primary/20 rounded-xl p-4 text-center"
                >
                  <p className="text-xl sm:text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs mt-1 text-gray-500 dark:text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Story Progress */}
            <div className="bg-gray-50 dark:bg-[#13121a] border border-gray-200 dark:border-primary/20 rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm tracking-widest text-primary mb-6">STORY PROGRESS</h3>

              {progress.length === 0 ? (
                <p className="text-gray-500 dark:text-white/30 text-sm italic">
                  No stories started yet.
                </p>
              ) : (
                <div className="space-y-5">
                  {progress.map((p) => (
                    <div key={p.story_id}>
                      <div className="flex justify-between mb-2">
                        <div>
                          <p>{p.story_title}</p>
                          <p className="text-xs text-gray-500 dark:text-white/40">
                            Scene {p.current_scene_order}
                          </p>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="text-primary text-sm">{p.xp_earned} XP</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {p.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-white/5 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{ width: p.status === "completed" ? "100%" : "50%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Challenge Progress */}
            <div className="bg-gray-50 dark:bg-[#13121a] border border-gray-200 dark:border-primary/20 rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm tracking-widest text-primary mb-6">CHALLENGE PROGRESS</h3>

              {challenges.length === 0 ? (
                <p className="text-gray-500 dark:text-white/30 text-sm italic">
                  No challenges attempted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {challenges.map((c) => (
                    <div key={c.challenge_id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm">{c.scene_title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1 bg-gray-200 dark:bg-white/5 rounded-full">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${c.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-white/40">
                            {c.progress}%
                          </span>
                        </div>
                      </div>
                      <p className="text-primary text-sm">{c.total_xp} XP</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}