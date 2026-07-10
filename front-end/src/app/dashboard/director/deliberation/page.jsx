"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useActiveYear } from "@/context/ActiveYearContext";
import { getSessions, getClasses, getClassementSession, getFrequenteBySalle, getAnnees, createRapport } from "@/lib/api";
import { imprimerPV } from "@/lib/print";
import { Gavel, Printer, Save } from "lucide-react";

const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "10px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };
const fmt = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");

const DECISIONS = ["Admis (passe en classe supérieure)", "Passage conditionnel", "Redouble"];
const decisionAuto = (moy) => (Number(moy) >= 10 ? DECISIONS[0] : DECISIONS[2]);

export default function DeliberationPage() {
  const { anneeId } = useActiveYear();
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [idSession, setIdSession] = useState("");
  const [idClasse, setIdClasse] = useState("");
  const [lignes, setLignes] = useState([]);       // [{matricule, prenom, nom, moyenne}]
  const [decisions, setDecisions] = useState({}); // { matricule: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSessions().then((s) => setSessions(Array.isArray(s) ? s : [])).catch(() => {});
    getClasses().then((c) => setClasses(Array.isArray(c) ? c : [])).catch(() => {});
    getAnnees().then((a) => setAnnees(Array.isArray(a) ? a : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idSession || !idClasse) { setLignes([]); return; }
    setLoading(true); setError(""); setInfo("");
    (async () => {
      try {
        const classe = classes.find((c) => String(c.idClasse) === String(idClasse));
        const mats = new Set();
        for (const s of classe?.salles || []) {
          const fr = await getFrequenteBySalle(s.idSalle).catch(() => []);
          fr
            .filter((f) => !anneeId || Number(f.anneeAcademique?.idAnnee) === Number(anneeId))
            .forEach((f) => f.eleve?.matricule && mats.add(Number(f.eleve.matricule)));
        }
        const d = await getClassementSession(idSession);
        const liste = (d?.classement || []).filter((l) => mats.has(Number(l.matricule)));
        setLignes(liste);
        const dec = {};
        liste.forEach((l) => (dec[l.matricule] = decisionAuto(l.moyenne)));
        setDecisions(dec);
      } catch (e) { setError(e.message || "Erreur de chargement."); setLignes([]); }
      finally { setLoading(false); }
    })();
  }, [idSession, idClasse, classes, anneeId]);

  // Année active globale (TopNav) ; repli sur la plus récente si non résolue
  const anneeActive =
    annees.find((a) => Number(a.idAnnee) === Number(anneeId)) ||
    annees.reduce((a, c) => (!a || Number(c.idAnnee) > Number(a.idAnnee) ? c : a), null);
  // Sessions restreintes à l'année active
  const sessionsAnnee = anneeId
    ? sessions.filter((s) => Number(s.trimestre?.anneeAcademique?.idAnnee) === Number(anneeId))
    : sessions;
  const libClasse = classes.find((c) => String(c.idClasse) === String(idClasse))?.libelle || "";
  const libSession = sessions.find((s) => String(s.idSession) === String(idSession))?.libelle || "";
  const admis = lignes.filter((l) => (decisions[l.matricule] || "").startsWith("Admis")).length;
  const tauxReussite = lignes.length ? Math.round((admis / lignes.length) * 100) : 0;

  const enregistrer = async () => {
    setInfo(""); setError("");
    if (!anneeActive) { setError("Aucune année académique en base."); return; }
    setSaving(true);
    try {
      for (const l of lignes) {
        await createRapport({
          libelle: "Décision de passage",
          points: 0,
          commentaire: `${decisions[l.matricule]} — ${libClasse}${libSession ? " · " + libSession : ""}`,
          event_date: new Date().toISOString().slice(0, 10),
          matricule: Number(l.matricule),
          idAca: Number(anneeActive.idAnnee),
        });
      }
      setInfo(`Décisions enregistrées pour ${lignes.length} élève(s).`);
    } catch (e) { setError(e.message || "Échec de l'enregistrement."); }
    finally { setSaving(false); }
  };

  const imprimer = () => {
    imprimerPV({
      classe: libClasse, session: libSession, annee: anneeActive?.libelle,
      lignes: lignes.map((l) => ({ ...l, decision: decisions[l.matricule] })),
    });
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Gavel size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Délibération</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 22 }}>Décisions de passage/redoublement et procès-verbal. Les décisions sont consignées dans le suivi de l'élève.</p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ minWidth: 240 }}>
          <label style={labelStyle}>Session</label>
          <select style={inputStyle} value={idSession} onChange={(e) => setIdSession(e.target.value)}>
            <option value="">— Choisir —</option>
            {sessionsAnnee.map((s) => <option key={s.idSession} value={s.idSession}>{s.libelle}{s.trimestre ? ` · ${s.trimestre.libelle}` : ""}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 240 }}>
          <label style={labelStyle}>Classe</label>
          <select style={inputStyle} value={idClasse} onChange={(e) => setIdClasse(e.target.value)}>
            <option value="">— Choisir —</option>
            {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
          </select>
        </div>
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {lignes.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14, padding: "12px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Taux de réussite (admis)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--orange)", fontFamily: "var(--font-display)" }}>{tauxReussite}%</div>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14, padding: "12px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Effectif</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>{lignes.length}</div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {!idSession || !idClasse ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Choisissez une session et une classe.</div>
        ) : loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : lignes.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Aucun élève noté pour cette session/classe.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={thStyle}>Élève</th><th style={thStyle}>Moyenne</th><th style={thStyle}>Décision</th>
            </tr></thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.matricule}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{l.prenom} {l.nom} <span style={{ color: "var(--muted)", fontWeight: 400 }}>#{l.matricule}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(l.moyenne)}/20</td>
                  <td style={tdStyle}>
                    <select style={{ ...inputStyle, padding: "7px 10px", maxWidth: 320 }} value={decisions[l.matricule] || ""} onChange={(e) => setDecisions((p) => ({ ...p, [l.matricule]: e.target.value }))}>
                      {DECISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {lignes.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <button onClick={enregistrer} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: saving ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer les décisions"}
          </button>
          <button onClick={imprimer} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <Printer size={16} /> Imprimer le PV
          </button>
          {info && <span style={{ fontSize: 13, color: "var(--muted)" }}>{info}</span>}
        </div>
      )}
    </div>
  );
}
