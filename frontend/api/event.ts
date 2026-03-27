import api from "./api";

/* ================= TYPES ================= */

export interface Event {
  id: string;
  story_id: string;
  title: string;
  description: string;
  started_at: string;
  ended_at: string;
  img_url?: string;
}

export interface CreateEventPayload {
  story_id: string;
  title: string;
  description: string;
  started_at: string; // ISO string
  ended_at: string;   // ISO string
  img_url?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

/* ================= API ================= */

// Get all events (optional filter by story_id)
export async function listEvents(story_id?: string): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events/", {
    params: story_id ? { story_id } : {},
  });
  return data;
}

// Get single event
export async function getEvent(eventId: string): Promise<Event> {
  const { data } = await api.get<Event>(`/events/${eventId}`);
  return data;
}

// Get timeline (sorted ASC by started_at)
export async function getTimeline(storyId: string): Promise<Event[]> {
  const { data } = await api.get<Event[]>(`/events/timeline/${storyId}`);
  return data;
}

// Create event
export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const { data } = await api.post<Event>("/events/", payload);
  return data;
}

// Update event
export async function updateEvent(
  eventId: string,
  payload: UpdateEventPayload
): Promise<Event> {
  const { data } = await api.put<Event>(`/events/${eventId}`, payload);
  return data;
}

// Delete event
export async function deleteEvent(eventId: string): Promise<void> {
  await api.delete(`/events/${eventId}`);
}

// Get active events (now between started_at & ended_at)
export async function listActiveEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events/active");
  return data;
}

// Get events in current year
export async function listYearEvents(): Promise<Event[]> {
  const { data } = await api.get<Event[]>("/events/year");
  return data;
}