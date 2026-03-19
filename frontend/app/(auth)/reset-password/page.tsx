/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/api/api";

function ResetForm() {
  const params   = useSearchParams();
  const token    = params.get("token") ?? "";
  const router   = useRouter();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Invalid or expired link. Request a new one.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <p style={{ color: "red" }}>Missing reset token. Please use the link from your email.</p>
    </main>
  );

  if (success) return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Password updated!</h1>
      <p>Redirecting you to login…</p>
    </main>
  );

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Set new password</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
               placeholder="New password" required minLength={6} style={inputStyle} />
        <input type="password" value={confirm}  onChange={e => setConfirm(e.target.value)}
               placeholder="Confirm password" required style={inputStyle} />
        {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}

const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15 };
const btnStyle   = { padding: "11px 0", borderRadius: 8, background: "#185FA5", color: "#fff",
                     border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500 };