import api from "./api";

export interface Character {
  id: string;
  name: string;
  role: string;
  culture_topic: string;
  description: string;
  personality: string;
  prompt_template: string;
  avatar_image_url: string;
  created_at: string;
}

export interface CharacterFilters {
  name?: string;
  culture_topic?: string;
  limit?: number;
  offset?: number;
  recent?: boolean;
}

export interface CreateCharacterPayload {
  name: string;
  role: string;
  culture_topic: string;
  description: string;
  personality: string;
  prompt_template: string;
  avatar_image_url: string;
}

export async function listCharacters(filters?: CharacterFilters): Promise<Character[]> {
  const { data } = await api.get<Character[]>("/characters/", { params: filters });
  return data;
}

export async function createCharacter(payload: CreateCharacterPayload): Promise<Character> {
  const { data } = await api.post<Character>("characters/", payload);
  return data;
}

export async function getCharacter(characterId: string): Promise<Character> {
  const { data } = await api.get<Character>(`/characters/${characterId}`);
  return data;
}

export async function updateCharacter(characterId: string, payload: CreateCharacterPayload): Promise<Character> {
  const { data } = await api.put<Character>(`/characters/${characterId}`, payload);
  return data;
}

export async function deleteCharacter(characterId: string): Promise<void> {
  await api.delete(`/characters/${characterId}`);
}

export async function listRecentCharacters(): Promise<Character[]> {
  const { data } = await api.get<Character[]>("/characters/recent");
  return data;
}

export async function listCharactersForStory(storyId: string): Promise<Character[]> {
  const { data } = await api.get<Character[]>(`/characters/story/${storyId}`);
  return data;
}

export async function assignCharacterToStory(storyId: string, characterId: string): Promise<void> {
  await api.post(`/characters/story/${storyId}/assign/${characterId}`);
}

export async function unassignCharacterFromStory(storyId: string, characterId: string): Promise<void> {
  await api.post(`/characters/story/${storyId}/unassign/${characterId}`);
}