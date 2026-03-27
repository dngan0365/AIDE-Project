"use client";

import { useEffect, useState } from "react";
import {
  listChallengesForScene, createChallenge, updateChallenge, deleteChallenge,
  Challenge, CreateChallengePayload, QuestionType,
} from "@/api/challenge";
import { listStories, Story } from "@/api/story";
import { listScenes, Scene } from "@/api/scene";
import { Plus, Pencil, Trash2, Zap, X, Check, Loader2, ChevronDown } from "lucide-react";

const QUESTION_TYPES: QuestionType[] = ["quiz", "puzzle", "riddle", "matching"];

const EMPTY = (sceneId: string): CreateChallengePayload => ({
  scene_id: sceneId, type: "quiz", options: null, correct_answer: "", max_attempt: 3,
});

export default function ChallengesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [form, setForm] = useState<CreateChallengePayload>(EMPTY(""));
  const [optionsRaw, setOptionsRaw] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState("");

  useEffect(() => { listStories().then(setStories); }, []);

  useEffect(() => {
    if (!selectedStoryId) { setScenes([]); setSelectedSceneId(""); return; }
    listScenes(selectedStoryId).then(s => {
      setScenes(s);
      if (s.length > 0) setSelectedSceneId(s[0].id);
      else setSelectedSceneId("");
    });
  }, [selectedStoryId]);

  useEffect(() => {
    if (!selectedSceneId) { setChallenges([]); return; }
    setLoading(true);
    listChallengesForScene(selectedSceneId).then(setChallenges).finally(() => setLoading(false));
  }, [selectedSceneId]);

  const openNew = () => {
    setEditing(null); setForm(EMPTY(selectedSceneId)); setOptionsRaw("{}"); setJsonError(""); setShowForm(true);
  };
  const openEdit = (c: Challenge) => {
    setEditing(c);
    setForm({ scene_id: c.scene_id, type: c.type, options: c.options, correct_answer: c.correct_answer, max_attempt: c.max_attempt });
    setOptionsRaw(c.options ? JSON.stringify(c.options, null, 2) : "{}");
    setJsonError(""); setShowForm(true);
  };

  const handleSubmit = async () => {
    let parsedOptions = null;
    if (optionsRaw.trim() && optionsRaw.trim() !== "{}") {
      try { parsedOptions = JSON.parse(optionsRaw); }
      catch { setJsonError("Invalid JSON in options"); return; }
    }
    setSaving(true);
    try {
      const payload = { ...form, options: parsedOptions };
      if (editing) await updateChallenge(editing.id, payload);
      else await createChallenge(payload);
      setShowForm(false);
      listChallengesForScene(selectedSceneId).then(setChallenges);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    setDeletingId(id);
    try {
      await deleteChallenge(id);
      listChallengesForScene(selectedSceneId).then(setChallenges);
    } finally { setDeletingId(null); }
  };

  const sceneLabel = (id: string) => {
    const s = scenes.find(sc => sc.id === id);
    return s ? `#${s.scene_order} – ${s.scene_type}` : id;
  };

  /* ─────────────────────────────────────────────────────────────
     Shared class snippets (keeps JSX readable)
  ───────────────────────────────────────────────────────────── */
  const selectCls =
    "w-full appearance-none " +
    "bg-white dark:bg-[#0a0c11] " +
    "border border-gray-200 dark:border-[#1e2130] " +
    "rounded px-3 py-2 text-sm " +
    "text-gray-800 dark:text-[#e8e6e1] " +
    "focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 " +
    "pr-8 transition-colors";

  const inputCls =
    "w-full " +
    "bg-white dark:bg-[#0a0c11] " +
    "border border-gray-200 dark:border-[#1e2130] " +
    "rounded px-3 py-2 text-sm " +
    "text-gray-800 dark:text-[#e8e6e1] " +
    "focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 " +
    "transition-colors";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        :root {
          --color-primary: #4ad4e4;
          --color-secondary: #77DAE6;
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
            <Zap size={12} style={{ color: "var(--color-primary)" }} />
            <span>Content</span>
          </div>
          <h1
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e8e6e1]"
          >
            Challenges
          </h1>
        </div>
        <button
          aria-label="Add new challenge"
          onClick={openNew}
          disabled={!selectedSceneId}
          className="flex items-center gap-2 text-[#0a0c11] text-sm font-semibold px-4 py-2 rounded hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 w-full sm:w-auto justify-center"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={15} /> New Challenge
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Story */}
        <div className="flex-1 sm:max-w-[14rem]">
          <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-2">
            Story
          </label>
          <div className="relative">
            <select
              aria-label="Select story"
              value={selectedStoryId}
              onChange={e => setSelectedStoryId(e.target.value)}
              className={selectCls}
            >
              <option value="">— pick story —</option>
              {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none" />
          </div>
        </div>

        {/* Scene */}
        <div className="flex-1 sm:max-w-[14rem]">
          <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-2">
            Scene
          </label>
          <div className="relative">
            <select
              aria-label="Select scene"
              value={selectedSceneId}
              onChange={e => setSelectedSceneId(e.target.value)}
              disabled={!scenes.length}
              className={`${selectCls} disabled:opacity-40`}
            >
              <option value="">— pick scene —</option>
              {scenes.map(s => <option key={s.id} value={s.id}>{sceneLabel(s.id)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Table (desktop) / Cards (mobile) ───────────────── */}

      {/* Desktop table */}
      <div className="hidden sm:block border border-gray-200 dark:border-[#1e2130] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#1e2130] bg-gray-50 dark:bg-[#0a0c11]">
              {["Type", "Correct Answer", "Max Attempts", "Has Options", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!selectedSceneId ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
                  Select a story and scene to view challenges
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 dark:text-[#4a5060]">
                  <Loader2 size={20} className="animate-spin mx-auto" style={{ color: "var(--color-primary)" }} />
                </td>
              </tr>
            ) : challenges.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
                  No challenges for this scene
                </td>
              </tr>
            ) : challenges.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b border-gray-100 dark:border-[#1e2130] hover:bg-gray-50 dark:hover:bg-[#1a1d2a] transition-colors ${i % 2 !== 0 ? "bg-gray-50/50 dark:bg-[#0d1018]" : "bg-white dark:bg-transparent"}`}
              >
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] tracking-widest px-2 py-1 rounded border"
                    style={{ borderColor: "rgba(74,212,228,0.25)", color: "var(--color-primary)", background: "rgba(74,212,228,0.08)" }}
                  >
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-[#e8e6e1] font-mono text-xs">{c.correct_answer}</td>
                <td className="px-4 py-3 font-mono" style={{ color: "var(--color-primary)" }}>{c.max_attempt}×</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] tracking-widest px-2 py-0.5 rounded border ${
                    c.options
                      ? "border-amber-400/20 text-amber-500 bg-amber-400/10 dark:text-amber-400"
                      : "border-gray-200 dark:border-[#1e2130] text-gray-400 dark:text-[#4a5060]"
                  }`}>
                    {c.options ? "YES" : "NO"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-gray-400 dark:text-[#6b7280] transition-colors hover:text-[#4ad4e4]"
                      aria-label="Edit challenge"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      className="text-gray-400 dark:text-[#6b7280] hover:text-red-500 transition-colors"
                      aria-label="Delete challenge"
                    >
                      {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {!selectedSceneId ? (
          <p className="text-center py-10 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
            Select a story and scene to view challenges
          </p>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-primary)" }} />
          </div>
        ) : challenges.length === 0 ? (
          <p className="text-center py-10 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
            No challenges for this scene
          </p>
        ) : challenges.map(c => (
          <div
            key={c.id}
            className="rounded-lg border border-gray-200 dark:border-[#1e2130] bg-white dark:bg-[#0d1018] p-4 flex items-start justify-between gap-4"
          >
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] tracking-widest px-2 py-0.5 rounded border"
                  style={{ borderColor: "rgba(74,212,228,0.25)", color: "var(--color-primary)", background: "rgba(74,212,228,0.08)" }}
                >
                  {c.type}
                </span>
                <span className={`text-[10px] tracking-widest px-2 py-0.5 rounded border ${
                  c.options
                    ? "border-amber-400/20 text-amber-500 bg-amber-400/10 dark:text-amber-400"
                    : "border-gray-200 dark:border-[#1e2130] text-gray-400 dark:text-[#4a5060]"
                }`}>
                  {c.options ? "Has options" : "No options"}
                </span>
              </div>
              <p className="font-mono text-xs text-gray-700 dark:text-[#e8e6e1] truncate">{c.correct_answer}</p>
              <p className="text-xs text-gray-400 dark:text-[#4a5060]">
                Max attempts: <span className="font-mono" style={{ color: "var(--color-primary)" }}>{c.max_attempt}×</span>
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => openEdit(c)}
                className="text-gray-400 hover:text-[#4ad4e4] transition-colors"
                aria-label="Edit challenge"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Delete challenge"
              >
                {deletingId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Slide-over form ─────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />

          {/* Panel — full-width on small screens, fixed width on sm+ */}
          <div className="w-full sm:w-[50vw] bg-white dark:bg-[#0a0c11] border-l border-gray-200 dark:border-[#1e2130] flex flex-col overflow-auto">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-[#1e2130]">
              <h2
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-bold text-gray-900 dark:text-[#e8e6e1]"
              >
                {editing ? "Edit Challenge" : "New Challenge"}
              </h2>
              <button aria-label="Close form" onClick={() => setShowForm(false)} className="text-gray-400 dark:text-[#4a5060] hover:text-gray-700 dark:hover:text-[#e8e6e1] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 px-5 sm:px-6 py-5 space-y-5 overflow-auto">

              {/* Type */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  Type
                </label>
                <div className="relative">
                  <select
                    aria-label = "question"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as QuestionType }))}
                    className={selectCls}
                  >
                    {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none" />
                </div>
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  Correct Answer
                </label>
                <input
                  aria-label="Correct answer input"
                  type="text"
                  value={form.correct_answer}
                  onChange={e => setForm(f => ({ ...f, correct_answer: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widests uppercase mb-1.5">
                  Max Attempts
                </label>
                <input
                  aria-label="Max attempts input"
                  type="number"
                  min={1}
                  value={form.max_attempt}
                  onChange={e => setForm(f => ({ ...f, max_attempt: Number(e.target.value) }))}
                  className={inputCls}
                />
              </div>

              {/* Options JSON */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widests uppercase mb-1.5">
                  Options <span className="text-gray-300 dark:text-[#2a2f3d] normal-case tracking-normal">(JSON)</span>
                </label>
                <textarea
                  rows={6}
                  value={optionsRaw}
                  onChange={e => { setOptionsRaw(e.target.value); setJsonError(""); }}
                  placeholder='{"A": "Option A", "B": "Option B"}'
                  className={`${inputCls} resize-none font-mono ${jsonError ? "!border-red-400/60 dark:!border-red-500/50" : ""}`}
                />
                {jsonError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{jsonError}</p>}
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-[#1e2130] flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 dark:border-[#1e2130] text-gray-500 dark:text-[#6b7280] text-sm py-2 rounded hover:border-gray-300 dark:hover:border-[#2e3340] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 text-[#0a0c11] text-sm font-semibold py-2 rounded hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--color-primary)" }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}