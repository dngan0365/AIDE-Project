import api from "./api";
import Cookies from "js-cookie";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export async function fetchUsers(): Promise<UserRow[]> {
  const { data } = await api.get<UserRow[]>("/admin/users");
  return data;
}

export async function updateUserRole(id: string, role: "user" | "admin") {
    await api.patch(`/admin/users/${id}/role?role=${role}`);
}

export async function deleteUser(id: string) {
    await api.delete(`/admin/users/${id}`);
}