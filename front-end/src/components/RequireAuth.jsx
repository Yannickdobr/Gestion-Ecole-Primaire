"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homePathFor, isAllowed } from "@/lib/roles";

/**
 * Garde d'accès.
 * - Session en cours de chargement → écran d'attente.
 * - Non connecté → /login.
 * - Connecté mais rôle non autorisé → renvoyé vers SON propre tableau de bord.
 *
 * Props :
 *   role       : "admin" | "personne" (optionnel)
 *   typeRoles  : tableau de typeRole autorisés (ex: [1] pour enseignant)
 */
export default function RequireAuth({ children, role, typeRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed = isAllowed(user, { role, typeRoles });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!allowed) {
      router.replace(homePathFor(user));
    }
  }, [user, loading, allowed, router]);

  if (loading || !user || !allowed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8a7060",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 14,
        }}
      >
        Chargement…
      </div>
    );
  }

  return children;
}
