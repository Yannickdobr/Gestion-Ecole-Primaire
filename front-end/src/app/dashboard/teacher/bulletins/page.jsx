"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveYear } from "@/context/ActiveYearContext";
import { getSessions, getClassementSession, getNotesEleve, getTitulaires, getFrequenteBySalle } from "@/lib/api";
import { imprimerBulletin } from "@/lib/print";
import { Award, Printer } from "lucide-react";

const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };
const fmt = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");
const medaille = (r) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`);

export default function TeacherBulletinsPage() {
  const { user } = useAuth();
  const { anneeId } = useActiveYear();
  const [titulaire, setTitulaire] = useState(null);
  const [matricules, setMatricules] = useState(new Set());
  const [sessions, setSessions] = useState([]);
  const [idSession, setIdSession] = useState("");
  const [classement, setClassement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [tits, sess] = await Promise.all([getTitulaires(), getSessions().catch(() => [])]);
        const mien = (Array.isArray(tits) ? tits : []).find((t) => Number(t.personne?.idPers) === Number(user?.id));
        if (!actif) return;
        setTitulaire(mien || null);
        setSessions(Array.isArray(sess) ? sess : []);
        if (mien?.salle?.idSalle) {
          const fr = await getFrequenteBySalle(mien.salle.idSalle).catch(() => []);
          if (!actif) return;
          // Roster de l'année active uniquement
          setMatricules(new Set((Array.isArray(fr) ? fr : [])
            .filter((f) => !anneeId || Number(f.anneeAcademique?.idAnnee) === Number(anneeId))
            .map((f) => Number(f.eleve?.matricule)).filter(Boolean)));
        }
      } catch { if (actif) setTitulaire(null); }
    })();
    return () => { actif = false; };
  }, [user?.id, anneeId]);

  useEffect(() => {
    if (!idSession || matricules.size === 0) { setClassement([]); return; }
    setLoading(true); setError("");
    getClassementSession(idSession)
      .then((d) => {
        const liste = (d?.classement || []).filter((l) => matricules.has(Number(l.matricule)));
        // Recalcule le rang au sein de la classe
        let rang = 0, prev = null;
        liste.forEach((l, i) => { if (prev === null || l.moyenne < prev) { rang = i + 1; prev = l.moyenne; } l.rang = rang; });
        setClassement(liste);
      })
      .catch((e) => { setError(e.message || "Erreur de chargement."); setClassement([]); })
      .finally(() => setLoading(false));
  }, [idSession, matricules]);

  const imprimer = async (l) => {
    const sessionLibelle = sessions.find((s) => String(s.idSession) === String(idSession))?.libelle || "";
    const n = await getNotesEleve(l.matricule).catch(() => []);
    const ns = (n || []).filter((x) => Number(x.session?.idSession) === Number(idSession));
    imprimerBulletin({ eleve: { matricule: l.matricule, prenom: l.prenom, nom: l.nom }, session: sessionLibelle, notes: ns, moyenne: l.moyenne, rang: l.rang, effectif: classement.length });
  };

  if (!titulaire) return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 16 }}>Bulletins de ma classe</h1>
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--surface-border)" }}>Vous n'êtes titulaire d'aucune classe.</div>
    </div>
  );

  const classe = titulaire.salle?.classe?.libelle || "—";

  // Sessions restreintes à l'année active
  const sessionsAnnee = anneeId
    ? sessions.filter((s) => Number(s.trimestre?.anneeAcademique?.idAnnee) === Number(anneeId))
    : sessions;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Award size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Bulletins de ma classe</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 22 }}>Classe <b>{classe}</b> · classement et bulletins par session.</p>

      <div style={{ maxWidth: 340, marginBottom: 20 }}>
        <label style={labelStyle}>Session</label>
        <select style={inputStyle} value={idSession} onChange={(e) => setIdSession(e.target.value)}>
          <option value="">— Choisir une session —</option>
          {sessionsAnnee.map((s) => <option key={s.idSession} value={s.idSession}>{s.libelle}{s.trimestre ? ` · ${s.trimestre.libelle}` : ""}</option>)}
        </select>
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {!idSession ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Sélectionnez une session.</div>
        ) : loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : classement.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Aucune note saisie pour cette session.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ ...thStyle, width: 70 }}>Rang</th><th style={thStyle}>Élève</th>
              <th style={thStyle}>Moyenne</th><th style={{ ...thStyle, textAlign: "right" }}>Bulletin</th>
            </tr></thead>
            <tbody>
              {classement.map((l) => (
                <tr key={l.matricule}>
                  <td style={{ ...tdStyle, fontWeight: 800, fontFamily: "var(--font-display)", color: l.rang <= 3 ? "var(--orange)" : "var(--text-dark)" }}>{medaille(l.rang)}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{l.prenom} {l.nom} <span style={{ color: "var(--muted)", fontWeight: 400 }}>#{l.matricule}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(l.moyenne)}/20</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button onClick={() => imprimer(l)} title="Imprimer le bulletin" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      <Printer size={13} /> Bulletin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {classement.length > 0 && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>{classement.length} élève(s) · rang calculé au sein de la classe.</p>}
    </div>
  );
}
