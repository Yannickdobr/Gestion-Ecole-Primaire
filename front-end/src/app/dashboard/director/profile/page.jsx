"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProfil } from "@/lib/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UserCheck, ShieldCheck, ShieldAlert } from "lucide-react";

// Libellés lisibles selon le rôle et le type
function libelleRole(role, typeRole) {
  if (role === "admin") {
    return { 0: "Root", 1: "Admin standard (déprécié)", 2: "Fondateur", 3: "Directeur" }[typeRole] || "Administrateur";
  }
  if (role === "personne") {
    return {
      1: "Enseignant",
      2: "Administratif (secrétariat)",
      3: "Scolarité (inscriptions)",
      4: "Parent",
      5: "Autres",
    }[typeRole] || "Personne";
  }
  return role || "—";
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessionOk, setSessionOk] = useState(null); // null = en cours, true/false ensuite
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        await getProfil(); // confirme que le token est valide côté serveur
        if (actif) setSessionOk(true);
      } catch (e) {
        if (actif) {
          setSessionOk(false);
          setError(e.message || "Session invalide ou expirée.");
        }
      }
    })();
    return () => {
      actif = false;
    };
  }, []);

  const champ = (label, value) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-dark)" }}>{value || "—"}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
          Mon profil
        </h1>
      </div>

      {/* Carte profil */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          borderRadius: 20,
          padding: 32,
        }}
      >
        {/* En-tête : avatar + nom */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--orange), var(--brown))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <UserCheck size={32} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
              {user?.nom || user?.username || "Utilisateur"}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              {libelleRole(user?.role, user?.typeRole)}
            </div>
          </div>

          {/* Badge état de session */}
          <div style={{ marginLeft: "auto" }}>
            {sessionOk === true && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(22,163,74,0.1)", color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
                <ShieldCheck size={14} /> Session vérifiée
              </span>
            )}
            {sessionOk === false && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: 12, fontWeight: 600 }}>
                <ShieldAlert size={14} /> Session invalide
              </span>
            )}
          </div>
        </div>

        {/* Détails */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {champ("Nom d'utilisateur", user?.username)}
          {champ("Rôle", libelleRole(user?.role, user?.typeRole))}
          {champ("Identifiant", user?.id)}
          {champ("Type de compte", user?.role)}
        </div>

        {error && (
          <div style={{ marginTop: 24, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
