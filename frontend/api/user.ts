import api from "./api";

export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  preferred_language: string;
}

export interface UpdateProfileParams {
  name?: string;
  avatar_url?: string;
  preferred_language?: string;
}

export interface UserProgress {
  story_title: ReactNode;
  user_id: string;
  story_id: string;
  sotry_title: string;
  current_scene_id: string;
  current_scene_order: number;
  status: string;
  xp_earned: number;
  updated_at: Date;
}

export interface UserChallengeProgress {
  challenge_id: string;
  user_id: string;
  scene_id: string;
  scene_title: string;
  total_xp: number;
  progress: number;
  updated_at: Date;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
}

export async function updateProfile(params: UpdateProfileParams): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>("/users/me", null, { params });
  return data;
}

export async function getUserProgress(): Promise<UserProgress[]> {
  const { data } = await api.get("/users/progress");
  return data;
}

export async function getUserChallengeProgress(): Promise<UserChallengeProgress[]> {
  const { data } = await api.get("/users/challenge");
  return data;
}