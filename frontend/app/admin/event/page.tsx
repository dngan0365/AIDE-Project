/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
  CreateEventPayload,
} from "@/api/event";
import { listStories, Story } from "@/api/story";
import { Plus, Pencil, Trash2, Layers, X, Check, Loader2, ChevronDown } from "lucide-react";
import UploadComponent from "@/components/ui/UploadFile";

const EMPTY = (storyId: string): CreateEventPayload => ({
  story_id: storyId,
  title: "",
  description: "",
  started_at: new Date().toISOString(),
  ended_at: new Date().toISOString(),
});

export default function EventsPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<CreateEventPayload>(EMPTY(""));

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    listStories().then((s) => {
      setStories(s);
      if (s.length > 0) setSelectedStoryId(s[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedStoryId) return;
    setLoading(true);
    listEvents(selectedStoryId)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [selectedStoryId]);

  /* ================= ACTIONS ================= */

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY(selectedStoryId));
    setShowForm(true);
  };

  const openEdit = (e: Event) => {
    setEditing(e);
    setForm({
      story_id: e.story_id,
      title: e.title,
      description: e.description,
      started_at: e.started_at,
      ended_at: e.ended_at,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editing) await updateEvent(editing.id, form);
      else await createEvent(form);

      setShowForm(false);
      listEvents(selectedStoryId).then(setEvents);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    setDeletingId(id);
    try {
      await deleteEvent(id);
      listEvents(selectedStoryId).then(setEvents);
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= STYLES ================= */

  const inputCls =
    "w-full bg-slate-100 dark:bg-[#0a0c11] border border-slate-200 dark:border-[#1e2130] rounded px-3 py-2 text-sm text-slate-800 dark:text-[#e8e6e1] focus:outline-none focus:border-[#4ad4e4]/60 dark:focus:border-[#4ad4e4]/50 transition-colors";

  const labelCls =
    "block text-[10px] text-slate-500 dark:text-[#4a5060] tracking-widest uppercase mb-1";

  /* ================= UI ================= */

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-transparent min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase mb-2">
            <Layers size={12} />
            <span>Content</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Events
          </h1>
        </div>

        <button
          onClick={openNew}
          disabled={!selectedStoryId}
          className="flex items-center gap-2 bg-[#4ad4e4] px-4 py-2 rounded text-sm font-semibold"
        >
          <Plus size={14} /> New Event
        </button>
      </div>

      {/* Story selector */}
      <div className="mb-6">
        <label className={labelCls}>Select Story</label>
        <div className="relative w-full sm:w-72">
          <select
            aria-label="Story selector"
            value={selectedStoryId}
            onChange={(e) => setSelectedStoryId(e.target.value)}
            className={`${inputCls} appearance-none pr-8`}
          >
            <option value="">— pick a story —</option>
            {stories.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2" size={14} />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {["Title", "Start", "End", "Description", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-xs uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!selectedStoryId ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  Select a story
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No events
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="px-4 py-2 text-[#4ad4e4]">{e.title}</td>

                  <td className="px-4 py-2">
                    {new Date(e.started_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    {new Date(e.ended_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-2 truncate max-w-xs">
                    {e.description}
                  </td>

                  <td className="px-4 py-2 flex gap-2">
                    <button aria-label="Edit event" onClick={() => openEdit(e)}>
                      <Pencil size={14} />
                    </button>

                    <button aria-label="Delete event" onClick={() => handleDelete(e.id)}>
                      {deletingId === e.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="fixed inset-0 flex z-50">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setShowForm(false)}
          />

          <div className="w-full sm:w-[50vw] bg-white p-6 overflow-auto">
            <h2 className="text-lg font-bold mb-4">
              {editing ? "Edit Event" : "New Event"}
            </h2>

            {/* Title */}
            <div className="mb-3">
              <label className={labelCls}>Title</label>
              <input
                aria-label="Event title"
                value={form.title}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, title: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label className={labelCls}>Description</label>
              <textarea
                aria-label="Event description"
                value={form.description}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, description: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            {/* Start */}
            <div className="mb-3">
              <label className={labelCls}>Start</label>
              <input
                aria-label="Event start"
                type="datetime-local"
                value={form.started_at.slice(0, 16)}
                onChange={(e) =>
                  setForm((f: any) => ({
                    ...f,
                    started_at: new Date(e.target.value).toISOString(),
                  }))
                }
                className={inputCls}
              />
            </div>

            {/* End */}
            <div className="mb-3">
              <label className={labelCls}>End</label>
              <input
                aria-label="Event end"
                type="datetime-local"
                value={form.ended_at.slice(0, 16)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ended_at: new Date(e.target.value).toISOString(),
                  }))
                }
                className={inputCls}
              />
            </div>
            <UploadComponent />
            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#4ad4e4] py-2 rounded flex justify-center"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Check size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}