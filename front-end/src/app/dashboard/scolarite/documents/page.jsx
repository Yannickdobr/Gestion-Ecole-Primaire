"use client";

import { useEffect, useState } from "react";
import { getEleves, getAnnees, getFrequenteByEleve } from "@/lib/api";
import { imprimerAttestation, imprimerCarte } from "@/lib/print";
import { FileSignature, IdCard, FileText } from "lucide-react";

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

export default function DocumentsPage() {
  const [eleves, setEleves] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [matricule, setMatricule] = useState("");
  const [idAca, setIdAca] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEleves().then((e) => setEleves(Array.isArray(e) ? e : [])).catch(() => {});
    getAnnees().then((a) => {
      const arr = Array.isArray(a) ? a : [];
      setAnnees(arr);
      const active = arr.reduce((x, c) => (!x || Number(c.idAnnee) > Number(x.idAnnee) ? c : x), null);
      if (active) setIdAca(String(active.idAnnee));
    }).catch(() => {});
  }, []);

  const contexte = async () => {
    const eleve = eleves.find((e) => String(e.matricule) === String(matricule));
    if (!eleve) { setError("Choisis un élève."); return null; }
    const annee = annees.find((a) => String(a.idAnnee) === String(idAca));
    let classe = "—";
    try {
      const fr = await getFrequenteByEleve(eleve.matricule);
      const list = Array.isArray(fr) ? fr : [];
      const match = list.find((f) => String(f.anneeAcademique?.idAnnee) === String(idAca)) || list[list.length - 1];
      classe = match?.salle?.classe?.libelle || "—";
    } catch { /* classe reste — */ }
    return { eleve, classe, annee: annee?.libelle };
  };

  const genererAttestation = async () => {
    setError(""); setBusy(true);
    try { const c = await contexte(); if (c) imprimerAttestation(c); }
    finally { setBusy(false); }
  };
  const genererCarte = async () => {
    setError(""); setBusy(true);
    try { const c = await contexte(); if (c) imprimerCarte(c); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <FileText size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Documents élève</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Générer un certificat de scolarité ou une carte d'élève pré-remplis.</p>

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={labelStyle}>Élève</label>
            <select style={inputStyle} value={matricule} onChange={(e) => setMatricule(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {eleves.map((e) => <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom} (#{e.matricule})</option>)}
            </select>
          </div>
          <div style={{ minWidth: 180 }}>
            <label style={labelStyle}>Année</label>
            <select style={inputStyle} value={idAca} onChange={(e) => setIdAca(e.target.value)}>
              <option value="">— Année —</option>
              {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ fontSize: 13, color: "#dc2626", marginBottom: 14 }}>{error}</div>}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={genererAttestation} disabled={busy || !matricule} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", background: busy || !matricule ? "rgba(216,99,16,0.4)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: busy || !matricule ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <FileSignature size={16} /> Certificat de scolarité
          </button>
          <button onClick={genererCarte} disabled={busy || !matricule} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 14, fontWeight: 600, cursor: busy || !matricule ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: busy || !matricule ? 0.5 : 1 }}>
            <IdCard size={16} /> Carte d'élève
          </button>
        </div>
      </div>
    </div>
  );
}
