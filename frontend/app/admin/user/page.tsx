"use client";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { useAuth } from "@/context/AuthContext";
 
interface UserRow {
  id: string; name: string; email: string; role: string; created_at: string;
}
 
export default function AdminUsersPage() {
  const [users, setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
 
  useEffect(() => {
    api.get<UserRow[]>("/admin/users")
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);
 
  async function toggleRole(user: UserRow) {
    const newRole = user.role === "admin" ? "user" : "admin";
    await api.patch(`/admin/users/${user.id}/role?role=${newRole}`);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  }
 
  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  }
 
  if (loading) return <p>Loading…</p>;
 
  return (
    <main style={{ maxWidth: 900, margin: "60px auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>User management</h1>
        <button onClick={logout}>Sign out</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
            <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th>
            <th style={th}>Joined</th><th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <span style={{
                  padding: "2px 10px", borderRadius: 12, fontSize: 12,
                  background: u.role === "admin" ? "#e0e8ff" : "#f0f0f0",
                  color: u.role === "admin" ? "#1a3e9e" : "#555",
                }}>
                  {u.role}
                </span>
              </td>
              <td style={td}>{new Date(u.created_at).toLocaleDateString()}</td>
              <td style={td}>
                <button onClick={() => toggleRole(u)} style={{ marginRight: 8, cursor: "pointer" }}>
                  Make {u.role === "admin" ? "user" : "admin"}
                </button>
                <button onClick={() => deleteUser(u.id)} style={{ color: "red", cursor: "pointer" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
 
const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 500 };
const td: React.CSSProperties = { padding: "10px 12px" };