import api from "./api";

export type QuestionType = "quiz" | "puzzle" | "riddle" | "matching";

export interface Challenge {
  id: string;
  scene_id: string;
  type: QuestionType;
  options: Record<string, unknown> | null;
  correct_answer: string;
  max_attempt: number;
  created_at: string;
}

export interface CreateChallengePayload {
  scene_id: string;
  type: QuestionType;
  options: Record<string, unknown> | null;
  correct_answer: string;
  max_attempt: number;
}

export async function listChallengesForScene(sceneId: string): Promise<Challenge[]> {
  const { data } = await api.get<Challenge[]>(`/challenges/scene/${sceneId}`);
  return data;
}

export async function getChallenge(challengeId: string): Promise<Challenge> {
  const { data } = await api.get<Challenge>(`/challenges/${challengeId}`);
  return data;
}

export async function createChallenge(payload: CreateChallengePayload): Promise<Challenge> {
  const { data } = await api.post<Challenge>("/challenges/", payload);
  return data;
}

export async function updateChallenge(challengeId: string, payload: CreateChallengePayload): Promise<Challenge> {
  const { data } = await api.put<Challenge>(`/challenges/${challengeId}`, payload);
  return data;
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  await api.delete(`/challenges/${challengeId}`);
}

export async function submitChallengeAttempt(challengeId: string, storyId: string, answerGiven: string): Promise<void> {
  await api.post(`/challenges/${challengeId}/attempt`, null, {
      params: { story_id: storyId, answer_given: answerGiven,},
    });
}

export async function getUserAttempts(challengeId: string, storyId: string): Promise<unknown> {
  const { data } = await api.get(`/challenges/${challengeId}/attempts`, {
    params: { story_id: storyId }
  });
  return data;
}