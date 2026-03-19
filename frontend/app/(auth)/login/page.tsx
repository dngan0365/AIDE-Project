"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/api/auth";
import { useAuth } from "@/app/context/AuthContext";
 
export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      await refreshUser();
      router.push(user.role === "admin" ? "/admin/users" : "/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="email"    value={email}    onChange={e => setEmail(e.target.value)}
               placeholder="Email" required style={inputStyle} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
               placeholder="Password" required style={inputStyle} />
        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        No account? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}
 
const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15 };
const btnStyle   = { padding: "11px 0", borderRadius: 8, background: "#185FA5", color: "#fff",
                     border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500 };