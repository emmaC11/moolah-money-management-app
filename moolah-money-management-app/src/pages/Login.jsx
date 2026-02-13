// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Single source of truth for Firebase Auth

// Read API base (e.g., http://localhost:3000/api/v1) from Vite env
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      // 1) Sign in on Firebase
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2) Get the Firebase ID token for this user
      const token = await cred.user.getIdToken();
      console.log('[FE] ID token (first 30 chars);', token.slice(0, 30), '...');

      // 3) Upsert the user in your backend (creates/updates user row)
      const upsertRes = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), 
      });

      if (!upsertRes.ok) {
        const err = await safeJson(upsertRes);
        throw new Error(err?.message || `Upsert failed (${upsertRes.status})`);
      }

      // 4) Fetch current user profile
      const meRes = await fetch(`${API_BASE}/user/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!meRes.ok) {
        const err = await safeJson(meRes);
        throw new Error(err?.message || `Fetch /me failed (${meRes.status})`);
      }

      const me = await meRes.json();
      setMessage(`Logged in.\n\n${JSON.stringify(me, null, 2)}`);
    } catch (err) {
      setMessage(`Login error: ${err.message}`);
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={card}>
        <h2 style={title}>Sign in</h2>

        <label style={label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={input}
            placeholder="you@company.com"
          />
        </label>

        <label style={label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={input}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" disabled={busy} style={button}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {message && (
          <pre style={pre}>
            {message}
          </pre>
        )}
      </form>
    </div>
  );
}

// Helpers & inline styles
async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

const container = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--background, #F9FAFB)",
  padding: 16
};

const card = {
  width: "100%",
  maxWidth: 420,
  background: "var(--card-bg, #FFFFFF)",
  border: "1px solid var(--border, #E5E7EB)",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  color: "var(--text-primary, #111827)"
};

const title = { margin: "0 0 16px 0", fontSize: 24 };
const label = { display: "block", fontSize: 14, marginBottom: 8 };
const input = {
  display: "block",
  width: "100%",
  marginTop: 6,
  marginBottom: 12,
  padding: "10px 12px",
  border: "1px solid var(--border, #E5E7EB)",
  borderRadius: 8,
  fontSize: 14,
  outline: "none"
};
const button = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid transparent",
  background: "var(--primary-green, #22C55E)",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};
const pre = {
  marginTop: 16,
  fontSize: 12,
  background: "#F6F8FA",
  padding: 12,
  borderRadius: 8,
  overflowX: "auto",
  whiteSpace: "pre-wrap"
};