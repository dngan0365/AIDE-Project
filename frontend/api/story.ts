import api from "./api";

export interface Story {
  id: string;
  title: string;
  culture_topic: string;
  description: string;
  cover_image_url: string;
  difficulty: number;
  estimated_time: string;
  is_published: boolean;
  estimated_minutes: number;
  country: string;
  culture_type: string;
  created_at: string;
  content: string;
}

export interface StoryFilters {
  country?: string;
  culture_type?: string;
  title?: string;
  limit?: number;
  offset?: number;
  recent?: boolean;
}

export interface CreateStoryPayload {
  title: string;
  culture_topic: string;
  description: string;
  cover_image_url: string;
  difficulty: number;
  estimated_time: string;
  is_published: boolean;
  estimated_minutes: number;
  country: string;
  culture_type: string;
  content: string;
}

export interface UserStory {
  current_scene_id: string;
  status: "not_started" | "in_progress" | "completed";
  xp_earned: number;
}

export type UpdateStoryPayload = Partial<CreateStoryPayload>;

export async function listStories(filters?: StoryFilters): Promise<Story[]> {
  const { data } = await api.get<Story[]>("/stories/", { params: filters });
  return data;
}

export async function createStory(payload: CreateStoryPayload): Promise<Story> {
  const { data } = await api.post<Story>("/stories/", payload);
  return data;
}

export async function getStory(storyId: string): Promise<Story> {
  const { data } = await api.get<Story>(`/stories/${storyId}`);
  return data;
}

export async function updateStory(storyId: string, payload: UpdateStoryPayload): Promise<Story> {
  const { data } = await api.put<Story>(`/stories/${storyId}`, payload);
  return data;
}

export async function deleteStory(storyId: string): Promise<void> {
  await api.delete(`/stories/${storyId}`);
}

export async function publishStory(storyId: string): Promise<Story> {
  const { data } = await api.put<Story>(`/stories/${storyId}/publish`);
  return data;
}
export async function startStory(storyId: string): Promise<UserStory> {
  const {data} = await api.post<UserStory>(`/stories/${storyId}/start`);
  return data;
}
export async function checkStartStory(storyId: string): Promise<UserStory> {
  const { data } = await api.get<UserStory>(`/stories/${storyId}/start`);
  return data;
}