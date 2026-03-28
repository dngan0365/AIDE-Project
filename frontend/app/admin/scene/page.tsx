/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  listScenes, createScene, updateScene, deleteScene,
  Scene, CreateScenePayload,
} from "@/api/scene";
import { listStories, Story } from "@/api/story";
import { listCharacters, Character } from "@/api/character";
import { Plus, Pencil, Trash2, Layers, X, Check, Loader2, ChevronDown } from "lucide-react";
import UploadComponent from "@/components/ui/UploadFile";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const EMPTY = (storyId: string): CreateScenePayload => ({
  story_id: storyId, scene_order: 1, narrative_text: "",
  character_id: "", background_image_url: "", scene_type: "narrative",
  content: "", reference: [],
});

export default function ScenesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Scene | null>(null);
  const [form, setForm] = useState<CreateScenePayload>(EMPTY(""));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  useEffect(() => {
    listStories().then(s => { setStories(s); if (s.length > 0) setSelectedStoryId(s[0].id); });
    listCharacters().then(setCharacters);
  }, []);

  useEffect(() => {
    if (!selectedStoryId) return;
    setLoading(true);
    listScenes(selectedStoryId).then(setScenes).finally(() => setLoading(false));
  }, [selectedStoryId]);

  const openNew = () => { setEditing(null); setForm(EMPTY(selectedStoryId)); setShowForm(true); };
  const openEdit = (s: Scene) => {
    setEditing(s);
    setForm({
      story_id: s.story_id, scene_order: s.scene_order, narrative_text: s.narrative_text,
      character_id: s.character_id, background_image_url: s.background_image_url, scene_type: s.scene_type,
      content: (s as any).content ?? "", reference: (s as any).reference ?? [],
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,

        // ✅ đảm bảo UUID hợp lệ
        story_id: form.story_id || selectedStoryId,
        character_id: form.character_id || "",

        // ✅ tránh undefined / null string
        narrative_text: form.narrative_text || "",

        // ✅ clean reference (array only, remove empty)
        reference: Array.isArray(form.reference)
          ? form.reference.filter((r) => r && r.trim() !== "")
          : [],

        // ✅ optional fields
        content: form.content || "",
        background_image_url: form.background_image_url || "",
      };

      console.log("🚀 payload:", payload); // debug

      if (editing) await updateScene(editing.id, payload);
      else await createScene(payload);

      setShowForm(false);
      listScenes(selectedStoryId).then(setScenes);
    } catch (err: any) {
      console.error("❌ ERROR:", err?.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this scene?")) return;
    setDeletingId(id);
    try { await deleteScene(id); listScenes(selectedStoryId).then(setScenes); } finally { setDeletingId(null); }
  };

  const charName = (id: string) => characters.find(c => c.id === id)?.name ?? id;

  const inputCls = "w-full bg-slate-100 dark:bg-[#0a0c11] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-800 dark:text-[#e8e6e1] focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 transition-colors";
  const labelCls = "block text-[10px] text-slate-500 dark:text-[#4a5060] tracking-widest uppercase mb-1";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-transparent min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
            <Layers size={12} /><span>Content</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-[#e8e6e1]">
            Scenes
          </h1>
        </div>
        <button
          onClick={openNew}
          disabled={!selectedStoryId}
          className="flex items-center gap-2 bg-[#4ad4e4] hover:bg-[#77DAE6] text-[#0a0c11] text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-40 w-full sm:w-auto justify-center"
        >
          <Plus size={15} /> New Scene
        </button>
      </div>

      {/* Story selector */}
      <div className="mb-6">
        <label className={labelCls}>Select Story</label>
        <div className="relative w-full sm:w-72">
          <select
            aria-label="Story selector"
            value={selectedStoryId}
            onChange={e => setSelectedStoryId(e.target.value)}
            className={`${inputCls} appearance-none pr-8`}
          >
            <option value="">— pick a story —</option>
            {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#4a5060] pointer-events-none" />
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block border border-slate-200 dark:border-[#1e2130] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e2130] bg-slate-50 dark:bg-[#0a0c11]">
              {["Order", "Type", "Character", "Narrative Preview", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-400 dark:text-[#4a5060] tracking-widest uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!selectedStoryId ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">Select a story to view scenes</td></tr>
            ) : loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#4a5060]">
                <Loader2 size={20} className="animate-spin mx-auto" />
              </td></tr>
            ) : scenes.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">No scenes for this story</td></tr>
            ) : scenes.sort((a, b) => a.scene_order - b.scene_order).map((s, i) => (
              <tr key={s.id} className={`border-b border-slate-200 dark:border-[#1e2130] hover:bg-slate-50 dark:hover:bg-[#1a1d2a] transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-[#0d1018]"}`}>
                <td className="px-4 py-3">
                  <span className="text-[#4ad4e4] font-mono">#{s.scene_order}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] tracking-widest px-2 py-1 rounded border border-[#4ad4e4]/20 text-[#4ad4e4] bg-[#4ad4e4]/10">{s.scene_type}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-[#6b7280]">{charName(s.character_id)}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-[#6b7280] max-w-xs truncate">{s.narrative_text}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button aria-label="Edit scene" onClick={() => openEdit(s)} className="text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors"><Pencil size={14} /></button>
                    <button aria-label="Delete scene" onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                      className="text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors">
                      {deletingId === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list — mobile */}
      <div className="md:hidden space-y-3">
        {!selectedStoryId ? (
          <p className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">Select a story to view scenes</p>
        ) : loading ? (
          <div className="flex justify-center py-12 text-slate-400 dark:text-[#4a5060]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : scenes.length === 0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">No scenes for this story</p>
        ) : scenes.sort((a, b) => a.scene_order - b.scene_order).map(s => (
          <div key={s.id} className="border border-slate-200 dark:border-[#1e2130] rounded-lg p-4 bg-white dark:bg-[#0d1018] space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[#4ad4e4] font-mono text-sm">#{s.scene_order}</span>
                <span className="text-[10px] tracking-widest px-2 py-0.5 rounded border border-[#4ad4e4]/20 text-[#4ad4e4] bg-[#4ad4e4]/10">{s.scene_type}</span>
              </div>
            </div>
            {s.character_id && (
              <p className="text-xs text-slate-500 dark:text-[#6b7280]">{charName(s.character_id)}</p>
            )}
            {s.narrative_text && (
              <p className="text-xs text-slate-500 dark:text-[#6b7280] line-clamp-2">{s.narrative_text}</p>
            )}
            <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-[#1e2130]">
              <button onClick={() => openEdit(s)} className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors ml-auto">
                {deletingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-[100vw] sm:w-[50vw] bg-white dark:bg-[#0a0c11] border-l border-slate-200 dark:border-[#1e2130] flex flex-col overflow-auto">
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-slate-200 dark:border-[#1e2130]">
              <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-bold text-slate-800 dark:text-[#e8e6e1]">
                {editing ? "Edit Scene" : "New Scene"}
              </h2>
              <button aria-label="Close form" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-[#4a5060] hover:text-slate-700 dark:hover:text-[#e8e6e1] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-5 sm:px-6 py-5 space-y-4 overflow-auto">
              {/* Story (locked) */}
              <div>
                <label className={labelCls}>Story</label>
                <input
                  aria-label="Story selector (disabled)"
                  readOnly
                  value={stories.find(s => s.id === form.story_id)?.title ?? form.story_id}
                  className="w-full bg-slate-100 dark:bg-[#0d1018] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-400 dark:text-[#4a5060]"
                />
              </div>

              {/* Character */}
              <div>
                <label className={labelCls}>Character</label>
                <div className="relative">
                  <select
                    aria-label="Character selector"
                    value={form.character_id}
                    onChange={e => setForm(f => ({ ...f, character_id: e.target.value }))}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    <option value="">— select character —</option>
                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#4a5060] pointer-events-none" />
                </div>
              </div>

              {/* Scene Type */}
              <div>
                <label className={labelCls}>Scene Type</label>
                <div className="relative">
                  <select
                    aria-label="Scene type selector"
                    value={form.scene_type}
                    onChange={e => setForm(f => ({ ...f, scene_type: e.target.value }))}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    {["narrative", "choice", "challenge", "cutscene"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#4a5060] pointer-events-none" />
                </div>
              </div>

              {/* Scene Order */}
              <div>
                <label className={labelCls}>Scene Order</label>
                <input
                  aria-label="Scene order input"
                  type="number"
                  value={form.scene_order}
                  onChange={e => setForm(f => ({ ...f, scene_order: Number(e.target.value) }))}
                  className={inputCls}
                />
              </div>

              {/* Background Image URL */}
              <div>
                <label className={labelCls}>Background Image URL</label>
                <input
                  aria-label="Background image URL input"
                  value={form.background_image_url}
                  onChange={e => setForm(f => ({ ...f, background_image_url: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Narrative Text */}
              <div>
                <label className={labelCls}>Narrative Text</label>
                <textarea
                  aria-label="Narrative text input"
                  rows={5}
                  value={form.narrative_text}
                  onChange={e => setForm(f => ({ ...f, narrative_text: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>
              {/* Content (Markdown) */}
              <div>
                <label className={labelCls}>Content</label>

                <div
                  data-color-mode={isDark ? "dark" : "light"}
                  className="border border-slate-200 dark:border-[#1e2130] rounded-lg overflow-hidden"
                >
                  <MDEditor
                    value={form.content}
                    onChange={(val) =>
                      setForm((f) => ({ ...f, content: val || "" }))
                    }
                    height={300}
                    preview="edit"
                    previewOptions={{
                      className: "prose dark:prose-invert max-w-none p-4",
                    }}
                  />
                </div>
              </div>
              {/* Reference List */}
              <div>
                <label className={labelCls}>Reference</label>

                <div className="space-y-2">
                  {form.reference.map((ref: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={ref}
                        onChange={(e) => {
                          const newRefs = [...form.reference];
                          newRefs[index] = e.target.value;
                          setForm((f) => ({ ...f, reference: newRefs }));
                        }}
                        placeholder={`Reference ${index + 1}`}
                        className={inputCls}
                      />

                      <button
                        aria-label="Remove reference"
                        type="button"
                        onClick={() => {
                          const newRefs = form.reference.filter((_, i) => i !== index);
                          setForm((f) => ({ ...f, reference: newRefs }));
                        }}
                        className="px-3 text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <button
                    aria-label="Add reference"
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        reference: [...f.reference, ""],
                      }))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    + Add reference
                  </button>
                </div>
              </div>
              <UploadComponent />
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-[#1e2130] flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-200 dark:border-[#1e2130] text-slate-500 dark:text-[#6b7280] text-sm py-2 rounded hover:border-slate-300 dark:hover:border-[#2e3340] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-[#4ad4e4] hover:bg-[#77DAE6] text-[#0a0c11] text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
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