"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { HelpCircle, ChevronDown, Mail } from "lucide-react";

const FAQ = [
  { q: "Comment inscrire un nouvel élève ?", r: "Menu « Élèves » → bouton « Inscrire un élève ». Renseigne le nom, prénom, la date de naissance, le sexe et la ville de naissance, puis valide." },
  { q: "Comment créer un compte parent et le relier à un élève ?", r: "Menu « Élèves » → bouton « Parents » sur la ligne de l'élève → « Créer et rattacher un parent ». Le parent pourra ensuite se connecter avec ses identifiants." },
  { q: "Comment saisir une note ?", r: "Menu « Évaluations » → onglet « Saisie de notes ». Sélectionne l'élève, puis « Nouvelle note ». Les cours, sessions et épreuves se gèrent dans l'onglet « Référentiels »." },
  { q: "Comment ajouter un créneau à l'emploi du temps ?", r: "Menu « Emploi du temps » → « Ajouter un créneau ». Choisis la classe, le cours, le jour et l'heure. Les conflits sont détectés automatiquement." },
  { q: "Comment envoyer un message aux parents ?", r: "Menu « Messagerie » → « Nouveau message ». Choisis l'expéditeur, l'élève puis le parent destinataire. Coche « envoi de masse » pour écrire à tous les parents d'un élève." },
];

export default function HelpPage() {
  const [ouvert, setOuvert] = useState(0);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <HelpCircle size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Aide</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Questions fréquentes sur l'utilisation de la plateforme.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {FAQ.map((item, i) => {
          const open = ouvert === i;
          return (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14, overflow: "hidden" }}>
              <button
                onClick={() => setOuvert(open ? -1 : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-dark)" }}>{item.q}</span>
                <ChevronDown size={18} style={{ color: "var(--muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
              </button>
              {open && (
                <div style={{ padding: "0 20px 18px", fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
                  {item.r}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact */}
      <div style={{ background: "linear-gradient(135deg, rgba(216,99,16,0.08), rgba(122,59,30,0.06))", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--orange)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Besoin d'aide supplémentaire ?</h3>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Contacte le support technique de l'établissement.</p>
        </div>
        <a href="/contact" style={{ padding: "10px 18px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--surface-border)", color: "var(--orange)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          Contacter
        </a>
      </div>
    </div>
  );
}
