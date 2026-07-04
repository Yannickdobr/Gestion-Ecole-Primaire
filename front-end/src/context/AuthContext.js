"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { refreshToken } from "@/lib/api";

const AuthContext = createContext(null);

// BNF-02 : politique de session
const INACTIVITE_MS = 30 * 60 * 1000; // déconnexion après 30 min sans activité
const RENOUVELLEMENT_MS = 20 * 60 * 1000; // renouveler le token après 20 min d'activité

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user session was saved in the browser on reload
  useEffect(() => {
    const savedUser = localStorage.getItem("activeUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("activeUser", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("activeUser");
    localStorage.removeItem("token");
    window.location.replace("/login");
  };

  // ── Session glissante (BNF-02) ────────────────────────────────────────────
  // Tant que l'utilisateur est actif, on renouvelle son token pour qu'il ne soit
  // pas déconnecté ; après 30 min sans aucune activité, on le déconnecte.
  useEffect(() => {
    if (!user) return;
    let derniereActivite = Date.now();
    let dernierRenouvellement = Date.now();
    const marquerActivite = () => { derniereActivite = Date.now(); };
    const evenements = ["mousedown", "keydown", "scroll", "touchstart"];
    evenements.forEach((e) =>
      window.addEventListener(e, marquerActivite, { passive: true }),
    );

    const intervalle = setInterval(async () => {
      const maintenant = Date.now();
      if (maintenant - derniereActivite >= INACTIVITE_MS) {
        logout(); // 30 min d'inactivité
        return;
      }
      if (maintenant - dernierRenouvellement >= RENOUVELLEMENT_MS) {
        try {
          const res = await refreshToken();
          if (res?.access_token) {
            localStorage.setItem("token", res.access_token);
            dernierRenouvellement = maintenant;
          }
        } catch {
          /* échec silencieux : géré au prochain appel API (401) */
        }
      }
    }, 60 * 1000);

    return () => {
      clearInterval(intervalle);
      evenements.forEach((e) => window.removeEventListener(e, marquerActivite));
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};