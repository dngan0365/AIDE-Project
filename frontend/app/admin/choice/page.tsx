"use client";

import { useEffect, useState } from "react";
import {
  listChoicesByScene,
  createChoice,
  updateChoice,
  deleteChoice,
  Choice,
  ChoiceCreate,
} from "@/api/scene";
import { listStories, Story } from "@/api/story";
import { listScenes, Scene } from "@/api/scene";
import {
  Plus,
  Pencil,
  Trash2,
  GitFork,
  X,
  Check,
  Loader2,
  ChevronDown,
  ArrowRight,
  Star,
} from "lucide-react";

const EMPTY = (sceneId: string): ChoiceCreate => ({
  scene_id: sceneId,
  choice_text: "",
  next_scene_id: "",
  xp_reward: 0,
  description: "",
});

export default function ChoicesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Choice | null>(null);
  const [form, setForm] = useState<ChoiceCreate>(EMPTY(""));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Data fetching ──────────────────────────────────── */
  useEffect(() => {
    listStories().then(setStories);
  }, []);

  useEffect(() => {
    if (!selectedStoryId) {
      setScenes([]);
      setSelectedSceneId("");
      return;
    }
    listScenes(selectedStoryId).then((s) => {
      setScenes(s);
      if (s.length > 0) setSelectedSceneId(s[0].id);
      else setSelectedSceneId("");
    });
  }, [selectedStoryId]);

  useEffect(() => {
    if (!selectedSceneId) {
      setChoices([]);
      return;
    }
    setLoading(true);
    listChoicesByScene(selectedSceneId)
      .then(setChoices)
      .finally(() => setLoading(false));
  }, [selectedSceneId]);

  /* ── Form helpers ───────────────────────────────────── */
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY(selectedSceneId));
    setShowForm(true);
  };

  const openEdit = (c: Choice) => {
    setEditing(c);
    setForm({
      scene_id: c.scene_id,
      choice_text: c.choice_text,
      next_scene_id: c.next_scene_id,
      xp_reward: c.xp_reward,
      description: c.description,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) await updateChoice(editing.id, form);
      else await createChoice(form);
      setShowForm(false);
      listChoicesByScene(selectedSceneId).then(setChoices);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this choice?")) return;
    setDeletingId(id);
    try {
      await deleteChoice(id);
      listChoicesByScene(selectedSceneId).then(setChoices);
    } finally {
      setDeletingId(null);
    }
  };

  const sceneLabel = (id: string) => {
    const s = scenes.find((sc) => sc.id === id);
    return s ? `#${s.scene_order} – ${s.scene_type}` : id;
  };

  /* ── Shared class snippets ──────────────────────────── */
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

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        :root {
          --color-primary: #4ad4e4;
          --color-secondary: #77DAE6;
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-gray-400 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
            <GitFork size={12} style={{ color: "var(--color-primary)" }} />
            <span>Content</span>
          </div>
          <h1
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[#e8e6e1]"
          >
            Choices
          </h1>
        </div>
        <button
          aria-label="Add new choice"
          onClick={openNew}
          disabled={!selectedSceneId}
          className="flex items-center gap-2 text-[#0a0c11] text-sm font-semibold px-4 py-2 rounded hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 w-full sm:w-auto justify-center"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={15} /> New Choice
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────── */}
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
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className={selectCls}
            >
              <option value="">— pick story —</option>
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none"
            />
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
              onChange={(e) => setSelectedSceneId(e.target.value)}
              disabled={!scenes.length}
              className={`${selectCls} disabled:opacity-40`}
            >
              <option value="">— pick scene —</option>
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {sceneLabel(s.id)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* ── Desktop table ───────────────────────────────── */}
      <div className="hidden sm:block border border-gray-200 dark:border-[#1e2130] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#1e2130] bg-gray-50 dark:bg-[#0a0c11]">
              {[
                "Choice Text",
                "Next Scene",
                "XP Reward",
                "Description",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!selectedSceneId ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide"
                >
                  Select a story and scene to view choices
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2
                    size={20}
                    className="animate-spin mx-auto"
                    style={{ color: "var(--color-primary)" }}
                  />
                </td>
              </tr>
            ) : choices.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide"
                >
                  No choices for this scene
                </td>
              </tr>
            ) : (
              choices.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-100 dark:border-[#1e2130] hover:bg-gray-50 dark:hover:bg-[#1a1d2a] transition-colors ${
                    i % 2 !== 0
                      ? "bg-gray-50/50 dark:bg-[#0d1018]"
                      : "bg-white dark:bg-transparent"
                  }`}
                >
                  {/* Choice Text */}
                  <td className="px-4 py-3 text-gray-700 dark:text-[#e8e6e1] font-mono text-xs max-w-[14rem] truncate">
                    {c.choice_text}
                  </td>

                  {/* Next Scene */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] tracking-widest px-2 py-1 rounded border"
                      style={{
                        borderColor: "rgba(74,212,228,0.25)",
                        color: "var(--color-primary)",
                        background: "rgba(74,212,228,0.08)",
                      }}
                    >
                      <ArrowRight size={10} />
                      {sceneLabel(c.next_scene_id) || c.next_scene_id}
                    </span>
                  </td>

                  {/* XP Reward */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 font-mono text-xs"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <Star size={10} />
                      {c.xp_reward} XP
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-gray-500 dark:text-[#6b7280] text-xs max-w-[16rem] truncate">
                    {c.description || (
                      <span className="text-gray-300 dark:text-[#2a2f3d]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-gray-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors"
                        aria-label="Edit choice"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-gray-400 dark:text-[#6b7280] hover:text-red-500 transition-colors"
                        aria-label="Delete choice"
                      >
                        {deletingId === c.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {!selectedSceneId ? (
          <p className="text-center py-10 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
            Select a story and scene to view choices
          </p>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <Loader2
              size={22}
              className="animate-spin"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
        ) : choices.length === 0 ? (
          <p className="text-center py-10 text-gray-400 dark:text-[#4a5060] text-xs tracking-wide">
            No choices for this scene
          </p>
        ) : (
          choices.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-gray-200 dark:border-[#1e2130] bg-white dark:bg-[#0d1018] p-4 flex items-start justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <p className="font-mono text-xs text-gray-700 dark:text-[#e8e6e1] truncate font-medium">
                  {c.choice_text}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[10px] tracking-widest px-2 py-0.5 rounded border"
                    style={{
                      borderColor: "rgba(74,212,228,0.25)",
                      color: "var(--color-primary)",
                      background: "rgba(74,212,228,0.08)",
                    }}
                  >
                    <ArrowRight size={9} />
                    {sceneLabel(c.next_scene_id) || c.next_scene_id}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] tracking-widests px-2 py-0.5 rounded border border-amber-400/20 text-amber-500 bg-amber-400/10 dark:text-amber-400"
                  >
                    <Star size={9} />
                    {c.xp_reward} XP
                  </span>
                </div>
                {c.description && (
                  <p className="text-xs text-gray-400 dark:text-[#4a5060] truncate">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="text-gray-400 hover:text-[#4ad4e4] transition-colors"
                  aria-label="Edit choice"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete choice"
                >
                  {deletingId === c.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Slide-over form ─────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />

          <div className="w-full sm:w-[50vw] bg-white dark:bg-[#0a0c11] border-l border-gray-200 dark:border-[#1e2130] flex flex-col overflow-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-[#1e2130]">
              <h2
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-bold text-gray-900 dark:text-[#e8e6e1]"
              >
                {editing ? "Edit Choice" : "New Choice"}
              </h2>
              <button
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                className="text-gray-400 dark:text-[#4a5060] hover:text-gray-700 dark:hover:text-[#e8e6e1] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 px-5 sm:px-6 py-5 space-y-5 overflow-auto">

              {/* Choice Text */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  Choice Text
                </label>
                <input
                  aria-label="Choice text input"
                  type="text"
                  value={form.choice_text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, choice_text: e.target.value }))
                  }
                  placeholder="What the player sees…"
                  className={inputCls}
                />
              </div>

              {/* Next Scene */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  Next Scene
                </label>
                <div className="relative">
                  <select
                    aria-label="Select next scene"
                    value={form.next_scene_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, next_scene_id: e.target.value }))
                    }
                    className={selectCls}
                  >
                    <option value="">— pick next scene —</option>
                    {scenes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {sceneLabel(s.id)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#4a5060] pointer-events-none"
                  />
                </div>
              </div>

              {/* XP Reward */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  XP Reward
                </label>
                <input
                  aria-label="XP reward input"
                  type="number"
                  min={0}
                  value={form.xp_reward}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, xp_reward: Number(e.target.value) }))
                  }
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-gray-400 dark:text-[#4a5060] tracking-widest uppercase mb-1.5">
                  Description{" "}
                  <span className="text-gray-300 dark:text-[#2a2f3d] normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Internal notes about this choice…"
                  className={`${inputCls} resize-none`}
                />
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
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Check size={15} />
                )}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}