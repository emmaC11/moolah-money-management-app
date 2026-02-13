// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "./components/common/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";
import Goals from "./pages/Goals.jsx";

// ⬇️ Make sure this path matches your actual Login component location.
// If your file is src/components/Login.jsx, use the line below:
import Login from "./components/login/login.jsx";

// Firebase auth instance exported from src/firebase.js
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Watch Firebase auth state (logged in / logged out)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    // Optional: nicer loading UI
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  // Not logged in → show Login page only
  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Moolah – Sign in</h1>
        <Login />
      </div>
    );
  }

  // Logged in → show app shell + routes
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/goals" element={<Goals />} />
        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
