/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

type SendMessagePayload = {
  scene_id: string;
  character_id?: string;
  message: string;
};

type RegeneratePayload = {
  scene_id: string;
  character_id?: string;
};

// ================= SEND MESSAGE =================
export async function sendMessage(payload: SendMessagePayload): Promise<any> {
  const { data } = await api.post("/chat/message", payload);
  return data;
}

// ================= GET HISTORY =================
export async function getChatHistory(scene_id: string): Promise<any> {
  const { data } = await api.get("/chat/history", {
    params: { scene_id },
  });
  return data;
}

// ================= DELETE HISTORY =================
export async function deleteChatHistory(scene_id: string): Promise<void> {
  await api.delete("/chat/history", {
    params: { scene_id },
  });
}

// ================= REGENERATE =================
export async function regenerateLastMessage(
  payload: RegeneratePayload
): Promise<any> {
  const { data } = await api.post("/chat/regenerate", payload);
  return data;
}