"use client";
import { useState } from "react";
import api from "@/api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);  // always show success — don't leak email existence
    } finally {
      setLoading(false);
    }
  }

  if (sent) return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Check your email</h1>
      <p>If an account exists for <strong>{email}</strong>, we sent a reset link. Check your inbox (and spam folder).</p>
    </main>
  );

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Forgot password</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: 20 }}>
        Enter your email and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com" required style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </main>
  );
}

const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15 };
const btnStyle   = { padding: "11px 0", borderRadius: 8, background: "#185FA5", color: "#fff",
                     border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500 };