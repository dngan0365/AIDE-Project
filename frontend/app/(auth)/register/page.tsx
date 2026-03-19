/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, loginUser } from "@/api/auth";
import { useAuth } from "@/app/context/AuthContext";
 
export default function RegisterPage() {
  const [form, setForm]   = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();
 
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      await loginUser(form.email, form.password);
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={form.name}     onChange={set("name")}     placeholder="Full name" required style={inputStyle} />
        <input type="email" value={form.email}    onChange={set("email")}    placeholder="Email"     required style={inputStyle} />
        <input type="password" value={form.password} onChange={set("password")} placeholder="Password"  required minLength={6} style={inputStyle} />
        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Have an account? <Link href="/login">Sign in</Link>
      </p>
    </main>
  );
}
 
const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15 };
const btnStyle   = { padding: "11px 0", borderRadius: 8, background: "#185FA5", color: "#fff",
                     border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500 };