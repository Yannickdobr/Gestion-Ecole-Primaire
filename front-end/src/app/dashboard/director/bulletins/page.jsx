"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useActiveYear } from "@/context/ActiveYearContext";
import { getSessions, getClassementSession, getNotesEleve, getClasses, getFrequenteBySalle } from "@/lib/api";
import { imprimerBulletin } from "@/lib/print";
import { Award, ChevronDown, Trophy, Printer } from "lucide-react";

const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

const fmt = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");
const medaille = (r) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`);

export default function BulletinsPage() {
  const { anneeId } = useActiveYear();
  const [sessions, setSessions] = useState([]);
  const [idSession, setIdSession] = useState("");
  const [data, setData] = useState(null); // { effectif, classement }
  const [classes, setClasses] = useState([]);
  const [idClasse, setIdClasse] = useState("");
  const [filteredData, setFilteredData] = useState(null); // { effectif, classement }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);     // matricule déplié
  const [notes, setNotes] = useState({});     // { matricule: [...] }

  useEffect(() => {
    getSessions().then((s) => setSessions(Array.isArray(s) ? s : [])).catch(() => setSessions([]));
    getClasses().then((c) => setClasses(Array.isArray(c) ? c : [])).catch(() => setClasses([]));
  }, []);

  useEffect(() => {
    if (!idSession) { setData(null); setFilteredData(null); return; }
    setLoading(true); setError(""); setOpen(null);
    getClassementSession(idSession)
      .then((d) => { setData(d); setFilteredData(d); })
      .catch((e) => { setError(e.message || "Erreur de chargement."); setData(null); setFilteredData(null); })
      .finally(() => setLoading(false));
  }, [idSession]);

  useEffect(() => {
    const filtrerParClasse = async () => {
      if (!data) return;
      if (!idClasse) { setFilteredData(data); return; }
      
      setLoading(true);
      try {
        const classeObj = classes.find((c) => String(c.idClasse) === String(idClasse));
        if (!classeObj || !classeObj.salles || classeObj.salles.length === 0) {
          setFilteredData({ effectif: 0, classement: [] });
          setLoading(false);
          return;
        }

        let allMatricules = new Set();
        for (const s of classeObj.salles) {
          const freq = await getFrequenteBySalle(s.idSalle).catch(() => []);
          // Ne retenir que les affectations de l'année active
          freq
            .filter((f) => !anneeId || Number(f.anneeAcademique?.idAnnee) === Number(anneeId))
            .forEach(f => { if (f.eleve?.matricule) allMatricules.add(Number(f.eleve.matricule)); });
        }

        const newClassement = data.classement.filter(l => allMatricules.has(Number(l.matricule)));
        
        // Re-calculate ranks for this specific class
        let rang = 0;
        let prev = null;
        newClassement.forEach((l, i) => {
          if (prev === null || l.moyenne < prev) { rang = i + 1; prev = l.moyenne; }
          l.rang = rang;
        });

        setFilteredData({ effectif: newClassement.length, classement: newClassement });
      } catch (e) {
        setError("Erreur de filtrage par classe.");
      } finally {
        setLoading(false);
      }
    };
    filtrerParClasse();
  }, [idClasse, data, classes]);

  const voirBulletin = async (matricule) => {
    if (open === matricule) { setOpen(null); return; }
    setOpen(matricule);
    if (!notes[matricule]) {
      try {
        const n = await getNotesEleve(matricule);
        setNotes((p) => ({ ...p, [matricule]: Array.isArray(n) ? n : [] }));
      } catch { setNotes((p) => ({ ...p, [matricule]: [] })); }
    }
  };

  // Sessions restreintes à l'année active
  const sessionsAnnee = anneeId
    ? sessions.filter((s) => Number(s.trimestre?.anneeAcademique?.idAnnee) === Number(anneeId))
    : sessions;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Award size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Bulletins & classement</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Moyennes pondérées par coefficient et rang par session.</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ minWidth: 260 }}>
          <label style={labelStyle}>Session</label>
          <select style={inputStyle} value={idSession} onChange={(e) => setIdSession(e.target.value)}>
            <option value="">— Choisir une session —</option>
            {sessionsAnnee.map((s) => <option key={s.idSession} value={s.idSession}>{s.libelle}{s.trimestre ? ` · ${s.trimestre.libelle}` : ""}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 260 }}>
          <label style={labelStyle}>Classe (Filtre Optionnel)</label>
          <select style={inputStyle} value={idClasse} onChange={(e) => setIdClasse(e.target.value)}>
            <option value="">— Toutes les classes —</option>
            {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {!idSession ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Sélectionnez une session pour afficher le classement.</div>
        ) : loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : !filteredData || filteredData.classement.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Aucune note saisie pour cette session.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={{ ...thStyle, width: 70 }}>Rang</th><th style={thStyle}>Élève</th>
              <th style={thStyle}>Moyenne</th><th style={thStyle}>Notes</th><th style={{ ...thStyle, textAlign: "right" }}>Bulletin</th>
            </tr></thead>
            <tbody>
              {filteredData.classement.map((l) => (
                <FragmentRow key={l.matricule} l={l} idSession={Number(idSession)}
                  sessionLibelle={sessions.find((s) => String(s.idSession) === String(idSession))?.libelle || ""}
                  effectif={filteredData.effectif}
                  open={open === l.matricule} notes={notes[l.matricule]} onToggle={() => voirBulletin(l.matricule)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      {filteredData && filteredData.effectif > 0 && (
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>{filteredData.effectif} élève(s) classé(s) · ex-aequo = même rang.</p>
      )}
    </div>
  );
}

function FragmentRow({ l, idSession, sessionLibelle, effectif, open, notes, onToggle }) {
  const notesSession = (notes || []).filter((n) => Number(n.session?.idSession) === idSession);

  const imprimer = async () => {
    let n = notes;
    if (!n) n = await getNotesEleve(l.matricule).catch(() => []);
    const ns = (n || []).filter((x) => Number(x.session?.idSession) === idSession);
    imprimerBulletin({ eleve: { matricule: l.matricule, prenom: l.prenom, nom: l.nom }, session: sessionLibelle, notes: ns, moyenne: l.moyenne, rang: l.rang, effectif });
  };

  return (
    <>
      <tr>
        <td style={{ ...tdStyle, fontWeight: 800, fontFamily: "var(--font-display)", color: l.rang <= 3 ? "var(--orange)" : "var(--text-dark)" }}>{medaille(l.rang)}</td>
        <td style={{ ...tdStyle, fontWeight: 600 }}>{l.prenom} {l.nom} <span style={{ color: "var(--muted)", fontWeight: 400 }}>#{l.matricule}</span></td>
        <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(l.moyenne)}/20</td>
        <td style={{ ...tdStyle, color: "var(--muted)" }}>{l.nbNotes}</td>
        <td style={{ ...tdStyle, textAlign: "right" }}>
          <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={imprimer} title="Imprimer le bulletin" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Printer size={13} /> Bulletin
            </button>
            <button onClick={onToggle} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Détail <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ padding: "0 18px 14px", background: "#faf8f5" }}>
            {!notes ? <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
              : notesSession.length === 0 ? <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Aucune note détaillée pour cette session.</div>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 0" }}>
                  {notesSession.map((n) => (
                    <span key={n.idEval} style={{ fontSize: 13, padding: "5px 12px", borderRadius: 999, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>
                      {n.cours?.libelle || "Cours"} <span style={{ opacity: 0.7 }}>(coef {n.cours?.coefficient ?? 1})</span> : <b>{n.note}/20</b>
                    </span>
                  ))}
                </div>
              )}
          </td>
        </tr>
      )}
    </>
  );
}
