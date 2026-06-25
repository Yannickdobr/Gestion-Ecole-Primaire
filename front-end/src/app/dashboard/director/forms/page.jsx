"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { FileText, Download, FilePlus2, FileSignature, ClipboardList } from "lucide-react";

const DOCUMENTS = [
  { titre: "Fiche d'inscription", desc: "Formulaire à remplir pour l'inscription d'un nouvel élève.", icon: <FilePlus2 size={20} /> },
  { titre: "Certificat de scolarité", desc: "Attestation officielle de scolarité de l'élève pour l'année en cours.", icon: <FileSignature size={20} /> },
  { titre: "Autorisation de sortie", desc: "Autorisation parentale pour les sorties pédagogiques.", icon: <ClipboardList size={20} /> },
  { titre: "Justificatif d'absence", desc: "Document à transmettre pour justifier l'absence d'un élève.", icon: <FileText size={20} /> },
];

export default function FormsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <FileText size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Formulaires</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Modèles de documents administratifs à imprimer ou remettre aux familles.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {DOCUMENTS.map((d) => (
          <div key={d.titre} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(216,99,16,0.1)", color: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {d.icon}
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 6 }}>{d.titre}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{d.desc}</p>
            </div>
            <button
              onClick={() => (typeof window !== "undefined" ? window.print() : null)}
              style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
            >
              <Download size={15} /> Imprimer le modèle
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 28, fontSize: 13, color: "#8a7060" }}>
        ℹ️ Ces modèles sont des documents statiques. La génération automatique (pré-remplie depuis la base) pourra être ajoutée ultérieurement.
      </p>
    </div>
  );
}
