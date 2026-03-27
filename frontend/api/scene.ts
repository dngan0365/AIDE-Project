import api from "./api";

export interface Scene {
  id: string;
  story_id: string;
  scene_order: number;
  narrative_text: string;
  character_id: string;
  background_image_url: string;
  scene_type: string;
  created_at: string;
}

export interface SceneChoice {
  id: string;
  scene_id: string;
  choice_text: string;
  next_scene_id: string;
  xp_reward: number;
  description: string;
  created_at: string;
}

export interface SceneChallengeUser {
  challenge_id: string;
  user_id: string;
  scene_id: string;
  scene_title: string;
  total_xp: number;
  progress: number;
  updated_at: string;
}

export interface CreateScenePayload {
  story_id: string;
  scene_order: number;
  narrative_text: string;
  character_id: string;
  background_image_url: string;
  scene_type: string;
}

export async function listScenes(storyId: string): Promise<Scene[]> {
  const { data } = await api.get<Scene[]>("/scenes/", { params: { story_id: storyId } });
  return data;
}

export async function createScene(payload: CreateScenePayload): Promise<Scene> {
  const { data } = await api.post<Scene>("/scenes/", payload);
  return data;
}

export async function getScene(sceneId: string): Promise<Scene> {
  const { data } = await api.get<Scene>(`/scenes/${sceneId}`);
  return data;
}

export async function updateScene(sceneId: string, payload: CreateScenePayload): Promise<Scene> {
  const { data } = await api.put<Scene>(`/scenes/${sceneId}`, payload);
  return data;
}

export async function deleteScene(sceneId: string): Promise<void> {
  await api.delete(`/scenes/${sceneId}`);
}

export async function getSceneChoices(sceneId: string): Promise<SceneChoice[]> {
  const { data } = await api.get<SceneChoice[]>(`/scenes/choices/${sceneId}`);
  return data;
}

export async function getSceneUserChoices(sceneId: string, userId: string): Promise<SceneChoice[]> {
  const { data } = await api.get<SceneChoice[]>(`/scenes/choices/${sceneId}/${userId}`);
  return data;
}

export async function getSceneChallengeUsers(sceneId: string): Promise<SceneChallengeUser[]> {
  const { data } = await api.get<SceneChallengeUser[]>(`/scenes/challenge-users/${sceneId}`);
  return data;
}

export async function getSceneChallengeUser(sceneId: string, userId: string): Promise<SceneChallengeUser> {
  const { data } = await api.get<SceneChallengeUser>(`/scenes/challenge-users/${sceneId}/${userId}`);
  return data;
}