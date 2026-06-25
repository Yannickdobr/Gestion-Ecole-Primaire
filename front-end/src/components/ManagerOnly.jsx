"use client";

import { useAuth } from "@/context/AuthContext";
import { estManager } from "@/lib/roles";
import { ShieldAlert } from "lucide-react";

/**
 * Réserve un contenu aux comptes de gestion (Root/Fondateur/Directeur).
 * L'« Admin standard » (agent de saisie) voit un message d'accès refusé.
 */
export default function ManagerOnly({ children }) {
  const { user } = useAuth();
  if (estManager(user)) return children;
  return (
    <div style={{ maxWidth: 640, margin: "40px auto", textAlign: "center", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 40 }}>
      <ShieldAlert size={40} style={{ color: "var(--orange)", marginBottom: 12 }} />
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 8 }}>Accès réservé à la direction</h2>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        Cette section (gestion du personnel et de la structure) est réservée au Directeur et au Fondateur.
        Votre compte « Admin standard » est dédié à la saisie courante.
      </p>
    </div>
  );
}
