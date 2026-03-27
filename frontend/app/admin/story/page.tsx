"use client";

import { useEffect, useState } from "react";
import {
  listStories, createStory, updateStory, deleteStory, publishStory,
  Story, CreateStoryPayload,
} from "@/api/story";
import { Plus, Pencil, Trash2, Globe, BookOpen, X, Check, Loader2 } from "lucide-react";
import UploadComponent from "@/components/ui/UploadFile";

const EMPTY: CreateStoryPayload = {
  title: "", culture_topic: "", description: "", cover_image_url: "",
  difficulty: 1, estimated_time: "", is_published: false,
  estimated_minutes: 0, country: "", culture_type: "",
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Story | null>(null);
  const [form, setForm] = useState<CreateStoryPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listStories().then(setStories).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (s: Story) => {
    setEditing(s);
    setForm({
      title: s.title, culture_topic: s.culture_topic, description: s.description,
      cover_image_url: s.cover_image_url, difficulty: s.difficulty, estimated_time: s.estimated_time,
      is_published: s.is_published, estimated_minutes: s.estimated_minutes, country: s.country, culture_type: s.culture_type,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) await updateStory(editing.id, form);
      else await createStory(form);
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    setDeletingId(id);
    try { await deleteStory(id); load(); } finally { setDeletingId(null); }
  };

  const handlePublish = async (id: string) => {
    await publishStory(id); load();
  };

  const field = (label: string, key: keyof CreateStoryPayload, type = "text") => (
    <div key={key}>
      <label className="block text-[10px] text-slate-500 dark:text-[#4a5060] tracking-widest uppercase mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          aria-label="Story form textarea"
          rows={3}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-slate-100 dark:bg-[#0a0c11] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-800 dark:text-[#e8e6e1] focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 resize-none transition-colors"
        />
      ) : type === "checkbox" ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form[key] as boolean}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
            className="accent-[#4ad4e4]"
            aria-label="Published checkbox"
          />
          <span className="text-sm text-slate-500 dark:text-[#6b7280]">Published</span>
        </label>
      ) : (
        <input
          aria-label="Story form field"
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
          className="w-full bg-slate-100 dark:bg-[#0a0c11] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-800 dark:text-[#e8e6e1] focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 transition-colors"
        />
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-transparent min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
            <BookOpen size={12} /><span>Content</span>
          </div>
          <h1
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-[#e8e6e1]"
          >
            Stories
          </h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#4ad4e4] hover:bg-[#77DAE6] text-[#0a0c11] text-sm font-semibold px-4 py-2 rounded transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={15} /> New Story
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block border border-slate-200 dark:border-[#1e2130] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e2130] bg-slate-50 dark:bg-[#0a0c11]">
              {["Title", "Country", "Culture Type", "Difficulty", "Status", "Actions"].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] text-slate-400 dark:text-[#4a5060] tracking-widest uppercase font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-[#4a5060]">
                  <Loader2 size={20} className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : stories.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">
                  No stories yet
                </td>
              </tr>
            ) : stories.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-slate-200 dark:border-[#1e2130] hover:bg-slate-50 dark:hover:bg-[#1a1d2a] transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-[#0d1018]"}`}
              >
                <td className="px-4 py-3 text-slate-800 dark:text-[#e8e6e1] font-medium">{s.title}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-[#6b7280]">{s.country}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-[#6b7280]">{s.culture_type}</td>
                <td className="px-4 py-3">
                  <span className="text-[#4ad4e4] font-mono">Lv.{s.difficulty}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] tracking-widest px-2 py-1 rounded border ${s.is_published
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/10"
                    : "text-slate-400 dark:text-[#4a5060] border-slate-200 dark:border-[#1e2130]"}`}>
                    {s.is_published ? "LIVE" : "DRAFT"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!s.is_published && (
                      <button
                        onClick={() => handlePublish(s.id)}
                        title="Publish"
                        className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                      >
                        <Globe size={14} />
                      </button>
                    )}
                    <button
                      aria-label="Edit story"
                      onClick={() => openEdit(s)}
                      className="text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      aria-label="Delete story"
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors"
                    >
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
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400 dark:text-[#4a5060]">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">No stories yet</p>
        ) : stories.map(s => (
          <div
            key={s.id}
            className="border border-slate-200 dark:border-[#1e2130] rounded-lg p-4 bg-white dark:bg-[#0d1018] space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-slate-800 dark:text-[#e8e6e1] font-medium text-sm leading-snug">{s.title}</p>
              <span className={`shrink-0 text-[10px] tracking-widest px-2 py-0.5 rounded border ${s.is_published
                ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/10"
                : "text-slate-400 dark:text-[#4a5060] border-slate-200 dark:border-[#1e2130]"}`}>
                {s.is_published ? "LIVE" : "DRAFT"}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-[#6b7280]">
              {s.country && <span>{s.country}</span>}
              {s.culture_type && <span>{s.culture_type}</span>}
              <span className="text-[#4ad4e4] font-mono">Lv.{s.difficulty}</span>
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-[#1e2130]">
              {!s.is_published && (
                <button
                  onClick={() => handlePublish(s.id)}
                  className="flex items-center gap-1 text-xs text-emerald-500 dark:text-emerald-400 hover:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  <Globe size={13} /> Publish
                </button>
              )}
              <button
                onClick={() => openEdit(s)}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                disabled={deletingId === s.id}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors ml-auto"
              >
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
          <div
            className="flex-1 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="w-full max-w-[100vw] sm:w-[50vw] bg-white dark:bg-[#0a0c11] border-l border-slate-200 dark:border-[#1e2130] flex flex-col overflow-auto">
            <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-slate-200 dark:border-[#1e2130]">
              <h2
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-lg font-bold text-slate-800 dark:text-[#e8e6e1]"
              >
                {editing ? "Edit Story" : "New Story"}
              </h2>
              <button
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                className="text-slate-400 dark:text-[#4a5060] hover:text-slate-700 dark:hover:text-[#e8e6e1] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 px-5 sm:px-6 py-5 space-y-4 overflow-auto">
              {field("Title", "title")}
              {field("Culture Topic", "culture_topic")}
              {field("Description", "description", "textarea")}
              {field("Cover Image URL", "cover_image_url")}
              {field("Country", "country")}
              {field("Culture Type", "culture_type")}
              {field("Estimated Time", "estimated_time")}
              {field("Estimated Minutes", "estimated_minutes", "number")}
              {field("Difficulty", "difficulty", "number")}
              {field("Published", "is_published", "checkbox")}
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
                className="flex-1 bg-primary hover:bg-secondary text-[#0a0c11] text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
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