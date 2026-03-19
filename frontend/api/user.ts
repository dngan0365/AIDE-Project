import api from "./api";
import { UserInformation } from "@/types/user";

export async function fetchUserInfo(): Promise<UserInformation | null> {
  try {
    const { data } = await api.get<UserInformation>("/users/me");
    return data;
  } catch {
    return null;
  }
}

export async function updateUserInfo(updates: Partial<UserInformation>): Promise<UserInformation> {
  const { data } = await api.patch<UserInformation>("/users/me", updates);
  return data;
}