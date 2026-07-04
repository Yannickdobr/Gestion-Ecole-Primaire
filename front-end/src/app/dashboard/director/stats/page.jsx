"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getSessions, getClassementSession, getStatsAbsences, getPaiementsAnnee, getAnnees } from "@/lib/api";
import { BarChart3, Trophy, CalendarX, Wallet } from "lucide-react";

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };
const fmtFCFA = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";

function Carte({ icon, titre, valeur, sous }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 22, flex: "1 1 220px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>{icon}{titre}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>{valeur}</div>
      {sous && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>{sous}</div>}
    </div>
  );
}

export default function StatsPage() {
  const [sessions, setSessions] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [idSession, setIdSession] = useState("");
  const [idAca, setIdAca] = useState("");
  const [reussite, setReussite] = useState(null);   // { taux, moyClasse, effectif }
  const [assiduite, setAssiduite] = useState(null); // { absences, retards, total }
  const [recouvre, setRecouvre] = useState(null);   // { total, nb }

  useEffect(() => {
    getSessions().then((s) => setSessions(Array.isArray(s) ? s : [])).catch(() => {});
    getAnnees().then((a) => {
      const arr = Array.isArray(a) ? a : [];
      setAnnees(arr);
      const active = arr.reduce((x, c) => (!x || Number(c.idAnnee) > Number(x.idAnnee) ? c : x), null);
      if (active) setIdAca(String(active.idAnnee));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idSession) { setReussite(null); return; }
    getClassementSession(idSession).then((d) => {
      const cl = d?.classement || [];
      const admis = cl.filter((l) => Number(l.moyenne) >= 10).length;
      const moy = cl.length ? cl.reduce((s, l) => s + (Number(l.moyenne) || 0), 0) / cl.length : 0;
      setReussite({ taux: cl.length ? Math.round((admis / cl.length) * 100) : 0, moyClasse: Math.round(moy * 100) / 100, effectif: cl.length });
    }).catch(() => setReussite(null));
  }, [idSession]);

  useEffect(() => {
    if (!idAca) { setAssiduite(null); setRecouvre(null); return; }
    getStatsAbsences(idAca).then((s) => setAssiduite(s || null)).catch(() => setAssiduite(null));
    getPaiementsAnnee(idAca).then((p) => {
      const arr = Array.isArray(p) ? p : [];
      setRecouvre({ total: arr.reduce((s, x) => s + (Number(x.montant) || 0), 0), nb: arr.length });
    }).catch(() => setRecouvre(null));
  }, [idAca]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <BarChart3 size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Statistiques</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 22 }}>Réussite, assiduité et recouvrement financier.</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ minWidth: 240 }}>
          <label style={labelStyle}>Année académique</label>
          <select style={inputStyle} value={idAca} onChange={(e) => setIdAca(e.target.value)}>
            <option value="">— Choisir —</option>
            {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 240 }}>
          <label style={labelStyle}>Session (pour la réussite)</label>
          <select style={inputStyle} value={idSession} onChange={(e) => setIdSession(e.target.value)}>
            <option value="">— Choisir —</option>
            {sessions.map((s) => <option key={s.idSession} value={s.idSession}>{s.libelle}{s.trimestre ? ` · ${s.trimestre.libelle}` : ""}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Carte icon={<Trophy size={16} />} titre="Taux de réussite"
          valeur={reussite ? `${reussite.taux}%` : "—"}
          sous={reussite ? `Moyenne de classe ${reussite.moyClasse}/20 · ${reussite.effectif} élève(s)` : "Choisir une session"} />
        <Carte icon={<CalendarX size={16} />} titre="Assiduité (année)"
          valeur={assiduite ? `${assiduite.absences} abs.` : "—"}
          sous={assiduite ? `${assiduite.retards} retard(s) · ${assiduite.total ?? assiduite.faitsTotal ?? 0} fait(s) au total` : "Choisir une année"} />
        <Carte icon={<Wallet size={16} />} titre="Recouvrement (année)"
          valeur={recouvre ? fmtFCFA(recouvre.total) : "—"}
          sous={recouvre ? `${recouvre.nb} versement(s) enregistré(s)` : "Choisir une année"} />
      </div>

      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 18 }}>
        Réussite = part d'élèves ayant une moyenne ≥ 10/20 sur la session choisie. Assiduité dérivée du suivi (absences/retards consignés).
      </p>
    </div>
  );
}
