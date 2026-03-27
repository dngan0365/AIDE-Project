"use client";

import { useEffect, useState } from "react";
import {
  listCharacters, createCharacter, updateCharacter, deleteCharacter,
  Character, CreateCharacterPayload,
} from "@/api/character";
import { Plus, Pencil, Trash2, Users, X, Check, Loader2 } from "lucide-react";

const EMPTY: CreateCharacterPayload = {
  name: "", role: "", culture_topic: "", description: "",
  personality: "", prompt_template: "", avatar_image_url: "",
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [form, setForm] = useState<CreateCharacterPayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listCharacters().then(setCharacters).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (c: Character) => {
    setEditing(c);
    setForm({
      name: c.name, role: c.role, culture_topic: c.culture_topic, description: c.description,
      personality: c.personality, prompt_template: c.prompt_template, avatar_image_url: c.avatar_image_url,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) await updateCharacter(editing.id, form);
      else await createCharacter(form);
      setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this character?")) return;
    setDeletingId(id);
    try { await deleteCharacter(id); load(); } finally { setDeletingId(null); }
  };

  const inputCls = "w-full bg-slate-100 dark:bg-[#0a0c11] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-800 dark:text-[#e8e6e1] focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 transition-colors";
  const labelCls = "block text-[10px] text-slate-500 dark:text-[#4a5060] tracking-widest uppercase mb-1";

  const field = (label: string, key: keyof CreateCharacterPayload, type = "text") => (
    <div key={key}>
      <label className={labelCls}>{label}</label>
      {type === "textarea" ? (
        <textarea
          aria-label={`${label} input`}
          rows={3}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          aria-label={`${label} input`}
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={inputCls}
        />
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-transparent min-h-screen">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-[#4a5060] text-xs tracking-widest uppercase mb-2">
            <Users size={12} /><span>Content</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-[#e8e6e1]">
            Characters
          </h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#4ad4e4] hover:bg-[#77DAE6] text-[#0a0c11] text-sm font-semibold px-4 py-2 rounded transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={15} /> New Character
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block border border-slate-200 dark:border-[#1e2130] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#1e2130] bg-slate-50 dark:bg-[#0a0c11]">
              {["Avatar", "Name", "Role", "Culture Topic", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-400 dark:text-[#4a5060] tracking-widest uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#4a5060]">
                <Loader2 size={20} className="animate-spin mx-auto" />
              </td></tr>
            ) : characters.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">No characters yet</td></tr>
            ) : characters.map((c, i) => (
              <tr key={c.id} className={`border-b border-slate-200 dark:border-[#1e2130] hover:bg-slate-50 dark:hover:bg-[#1a1d2a] transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50 dark:bg-[#0d1018]"}`}>
                <td className="px-4 py-3">
                  {c.avatar_image_url ? (
                    <img src={c.avatar_image_url} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#1e2130]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#4ad4e4]/10 border border-[#4ad4e4]/20 flex items-center justify-center text-[#4ad4e4] text-xs font-medium">
                      {c.name[0]}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-[#e8e6e1] font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] tracking-widest px-2 py-1 rounded border border-[#4ad4e4]/20 text-[#4ad4e4] bg-[#4ad4e4]/10">{c.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-[#6b7280]">{c.culture_topic}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button aria-label="Edit character" onClick={() => openEdit(c)} className="text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors"><Pencil size={14} /></button>
                    <button aria-label="Delete character" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                      className="text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors">
                      {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
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
        ) : characters.length === 0 ? (
          <p className="text-center py-12 text-slate-400 dark:text-[#4a5060] text-xs tracking-wide">No characters yet</p>
        ) : characters.map(c => (
          <div key={c.id} className="border border-slate-200 dark:border-[#1e2130] rounded-lg p-4 bg-white dark:bg-[#0d1018] space-y-2">
            <div className="flex items-center gap-3">
              {c.avatar_image_url ? (
                <img src={c.avatar_image_url} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#1e2130] shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#4ad4e4]/10 border border-[#4ad4e4]/20 flex items-center justify-center text-[#4ad4e4] text-sm font-medium shrink-0">
                  {c.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-slate-800 dark:text-[#e8e6e1] font-medium text-sm truncate">{c.name}</p>
                {c.culture_topic && (
                  <p className="text-xs text-slate-400 dark:text-[#6b7280] truncate">{c.culture_topic}</p>
                )}
              </div>
              {c.role && (
                <span className="ml-auto shrink-0 text-[10px] tracking-widest px-2 py-0.5 rounded border border-[#4ad4e4]/20 text-[#4ad4e4] bg-[#4ad4e4]/10">
                  {c.role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-slate-100 dark:border-[#1e2130]">
              <button onClick={() => openEdit(c)} className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-[#4ad4e4] transition-colors">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                className="flex items-center gap-1 text-xs text-slate-400 dark:text-[#6b7280] hover:text-red-400 transition-colors ml-auto">
                {deletingId === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
                {editing ? "Edit Character" : "New Character"}
              </h2>
              <button aria-label="Close form" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-[#4a5060] hover:text-slate-700 dark:hover:text-[#e8e6e1] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 px-5 sm:px-6 py-5 space-y-4 overflow-auto">
              {field("Name", "name")}
              {field("Role", "role")}
              {field("Culture Topic", "culture_topic")}
              {field("Avatar Image URL", "avatar_image_url")}
              {field("Description", "description", "textarea")}
              {field("Personality", "personality", "textarea")}
              {field("Prompt Template", "prompt_template", "textarea")}
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-[#1e2130] flex gap-3">
              <button
                aria-label="Cancel"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-slate-200 dark:border-[#1e2130] text-slate-500 dark:text-[#6b7280] text-sm py-2 rounded hover:border-slate-300 dark:hover:border-[#2e3340] transition-colors"
              >
                Cancel
              </button>
              <button
                aria-label="Submit character form"
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