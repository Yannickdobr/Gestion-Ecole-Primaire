"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import ChangePassword from "@/components/ChangePassword";
import { Settings, User, Shield, LogOut } from "lucide-react";

function libelleRole(role, typeRole) {
  if (role === "admin") return { 0: "Root", 1: "Administrateur", 2: "Fondateur", 3: "Directeur" }[typeRole] || "Administrateur";
  if (role === "personne") return { 1: "Enseignant", 2: "Administratif", 3: "Scolarité", 4: "Parent", 5: "Autre" }[typeRole] || "Personne";
  return role || "—";
}

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const ligne = (label, value) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--surface-border)" }}>
      <span style={{ fontSize: 14, color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>{value || "—"}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Settings size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Paramètres</h1>
      </div>

      {/* Compte */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <User size={18} style={{ color: "var(--orange)" }} /> Compte
        </h2>
        {ligne("Nom", user?.nom || user?.username)}
        {ligne("Nom d'utilisateur", user?.username)}
        {ligne("Rôle", libelleRole(user?.role, user?.typeRole))}
        {ligne("Identifiant", user?.id)}
      </div>

      {/* Sécurité */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={18} style={{ color: "var(--orange)" }} /> Sécurité
        </h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          La session est sécurisée par un jeton (JWT) valable 8 heures. Pour des raisons de sécurité, déconnecte-toi après usage sur un poste partagé.
        </p>
        <button
          onClick={logout}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      {/* Changer le mot de passe */}
      <div style={{ marginBottom: 20 }}>
        <ChangePassword />
      </div>
    </div>
  );
}
