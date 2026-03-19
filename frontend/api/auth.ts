import api from "./api";
import Cookies from "js-cookie";
 
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar_url?: string;
  favorite_culture?: string;
  preferred_language?: string;
}
 
export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const { data } = await api.post<User>("/auth/register", { name, email, password });
  return data;
}
 
export async function loginUser(email: string, password: string): Promise<User> {
  const { data } = await api.post<{ access_token: string; refresh_token: string }>(
    "/auth/login", { email, password }
  );
  Cookies.set("access_token",  data.access_token,  { expires: 1, sameSite: "strict" });
  Cookies.set("refresh_token", data.refresh_token, { expires: 7, sameSite: "strict" });
  const me = await api.get<User>("/users/me");
  return me.data;
}
 
export async function logoutUser() {
  await api.post("/auth/logout").catch(() => {});
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}
 
export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/users/me");
    return data;
  } catch {
    return null;
  }
}