"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getTitulaires, getFrequenteBySalle, getNotesEleve, getAnnees,
  getRapportsEleve, createRapport, getJustificatifs,
} from "@/lib/api";
import { Users2, BookOpen, ChevronDown, ClipboardList, Plus, CheckCircle2 } from "lucide-react";

const thStyle = { padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 20px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid var(--surface-border)", fontSize: 13.5, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 600, color: "#4a3728", marginBottom: 4 };

// Presets pour consigner rapidement un fait (absences incluses, faute de table dédiée)
const TYPES_SUIVI = ["Absence", "Retard", "Discipline", "Encouragement"];

const fmtMoy = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");

function moyenneDe(notes) {
  let pts = 0, coef = 0;
  for (const n of notes || []) {
    const c = Number(n.cours?.coefficient) || 1;
    pts += (Number(n.note) || 0) * c;
    coef += c;
  }
  return coef ? pts / coef : null;
}

export default function MaClasse() {
  const { user } = useAuth();
  const [titulaire, setTitulaire] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idAca, setIdAca] = useState(null);

  const [notes, setNotes] = useState({});      // { matricule: [...] }
  const [moyennes, setMoyennes] = useState({}); // { matricule: number|null }
  const [open, setOpen] = useState(null);       // matricule déplié
  const [panel, setPanel] = useState("notes");  // 'notes' | 'suivi'
  const [justifies, setJustifies] = useState(new Set()); // idRapport ayant un justificatif VALIDÉ

  useEffect(() => {
    getJustificatifs().then((js) => {
      const set = new Set();
      (Array.isArray(js) ? js : []).forEach((j) => { if (j.idDirecteur) set.add(Number(j.idRapport)); });
      setJustifies(set);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [tits, annees] = await Promise.all([getTitulaires(), getAnnees().catch(() => [])]);
        const mien = (Array.isArray(tits) ? tits : []).find(
          (t) => Number(t.personne?.idPers) === Number(user?.id),
        );
        if (!actif) return;
        setTitulaire(mien || null);
        const annee = (Array.isArray(annees) ? annees : []).reduce(
          (acc, a) => (!acc || Number(a.idAnnee) > Number(acc.idAnnee) ? a : acc), null);
        setIdAca(annee?.idAnnee ?? null);

        if (mien?.salle?.idSalle) {
          const fr = await getFrequenteBySalle(mien.salle.idSalle);
          const liste = (Array.isArray(fr) ? fr : []).map((f) => f.eleve).filter(Boolean);
          if (!actif) return;
          setEleves(liste);
          // Précharge les notes de chaque élève → moyennes affichées dans le tableau
          const paires = await Promise.all(liste.map(async (e) => {
            const n = await getNotesEleve(e.matricule).catch(() => []);
            return [e.matricule, Array.isArray(n) ? n : []];
          }));
          if (!actif) return;
          const nMap = {}, mMap = {};
          for (const [mat, n] of paires) { nMap[mat] = n; mMap[mat] = moyenneDe(n); }
          setNotes(nMap);
          setMoyennes(mMap);
        }
      } catch {
        if (actif) setTitulaire(null);
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => { actif = false; };
  }, [user?.id]);

  const basculer = (matricule, p) => {
    if (open === matricule && panel === p) { setOpen(null); return; }
    setOpen(matricule); setPanel(p);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;

  if (!titulaire) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 16 }}>Ma classe</h1>
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--surface-border)" }}>
          Vous n'êtes titulaire d'aucune classe pour le moment.
        </div>
      </div>
    );
  }

  const classe = titulaire.salle?.classe?.libelle || "—";
  const salle = titulaire.salle?.libelle || "—";
  const moyClasse = (() => {
    const vals = Object.values(moyennes).filter((m) => m != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Users2 size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Ma classe</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        Classe <b>{classe}</b> · Salle <b>{salle}</b> · {eleves.length} élève(s)
        {moyClasse != null && <> · moyenne de classe <b>{fmtMoy(moyClasse)}/20</b></>}
      </p>

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={thStyle}>Élève</th><th style={thStyle}>Matricule</th><th style={thStyle}>Sexe</th>
            <th style={thStyle}>Moyenne</th><th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr></thead>
          <tbody>
            {eleves.length === 0 ? (
              <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={5}>Aucun élève affecté à cette classe.</td></tr>
            ) : eleves.map((e) => (
              <FragmentRow
                key={e.matricule} e={e}
                moyenne={moyennes[e.matricule]}
                notes={notes[e.matricule]}
                open={open === e.matricule} panel={panel}
                onNotes={() => basculer(e.matricule, "notes")}
                onSuivi={() => basculer(e.matricule, "suivi")}
                idAca={idAca} idPers={user?.id} justifies={justifies}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({ e, moyenne, notes, open, panel, onNotes, onSuivi, idAca, idPers, justifies }) {
  return (
    <>
      <tr>
        <td style={tdStyle}><span style={{ fontWeight: 600 }}>{e.prenom} {e.nom}</span></td>
        <td style={{ ...tdStyle, color: "var(--muted)" }}>#{e.matricule}</td>
        <td style={{ ...tdStyle, color: "var(--muted)" }}>{Number(e.sexe) === 2 ? "Féminin" : "Masculin"}</td>
        <td style={{ ...tdStyle, fontWeight: 700 }}>{moyenne != null ? `${fmtMoy(moyenne)}/20` : <span style={{ color: "var(--muted)", fontWeight: 400 }}>—</span>}</td>
        <td style={{ ...tdStyle, textAlign: "right" }}>
          <div style={{ display: "inline-flex", gap: 8 }}>
            <button onClick={onNotes} style={btnStyle(open && panel === "notes")}>
              <BookOpen size={14} /> Notes <ChevronDown size={13} style={{ transform: open && panel === "notes" ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            <button onClick={onSuivi} style={btnStyle(open && panel === "suivi")}>
              <ClipboardList size={14} /> Suivi <ChevronDown size={13} style={{ transform: open && panel === "suivi" ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ padding: "0 20px 16px", background: "#faf8f5" }}>
            {panel === "notes"
              ? <PanneauNotes notes={notes} />
              : <PanneauSuivi matricule={e.matricule} idAca={idAca} idPers={idPers} justifies={justifies} />}
          </td>
        </tr>
      )}
    </>
  );
}

function PanneauNotes({ notes }) {
  if (!notes) return <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Chargement…</div>;
  if (notes.length === 0) return <div style={{ padding: 12, color: "var(--muted)", fontSize: 13 }}>Aucune note.</div>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 0" }}>
      {notes.map((n) => (
        <span key={n.idEval} style={{ fontSize: 13, padding: "4px 10px", borderRadius: 999, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>
          {n.cours?.libelle || "Cours"} : <b>{n.note}/20</b>
        </span>
      ))}
    </div>
  );
}

function PanneauSuivi({ matricule, idAca, idPers, justifies }) {
  const [rapports, setRapports] = useState(null);
  const [form, setForm] = useState({ libelle: "Absence", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
  const [envoi, setEnvoi] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try { const r = await getRapportsEleve(matricule); if (actif) setRapports(Array.isArray(r) ? r : []); }
      catch { if (actif) setRapports([]); }
    })();
    return () => { actif = false; };
  }, [matricule]);

  const ajouter = async (ev) => {
    ev.preventDefault();
    setErr("");
    if (!form.libelle.trim()) { setErr("Le libellé est requis."); return; }
    if (!idAca) { setErr("Aucune année académique en base : crée-en une d'abord."); return; }
    setEnvoi(true);
    try {
      await createRapport({
        libelle: form.libelle.trim(),
        points: form.points === "" ? 0 : Number(form.points),
        commentaire: form.commentaire.trim() || undefined,
        event_date: form.event_date || undefined,
        matricule: Number(matricule),
        idAca: Number(idAca),
        idPers: idPers ? Number(idPers) : undefined,
      });
      setForm({ libelle: "Absence", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
      const r = await getRapportsEleve(matricule);
      setRapports(Array.isArray(r) ? r : []);
    } catch (e) { setErr(e.message || "Échec de l'enregistrement."); }
    finally { setEnvoi(false); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, padding: "12px 0" }}>
      {/* Historique */}
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4a3728", marginBottom: 8 }}>Historique du suivi</div>
        {!rapports ? <div style={{ color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
          : rapports.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 13 }}>Aucun fait consigné.</div>
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rapports.map((r) => (
                <div key={r.idRap} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 12, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-dark)" }}>{r.libelle}</span>
                    {Number(r.points) > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{r.points} pt(s)</span>}
                    {justifies && justifies.has(Number(r.idRap)) && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 600, padding: "1px 7px", borderRadius: 999, background: "rgba(22,163,74,0.12)", color: "#16a34a" }}><CheckCircle2 size={11} /> Justifié</span>}
                    <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: "auto" }}>{r.event_date ? new Date(r.event_date).toLocaleDateString("fr-FR") : ""}</span>
                  </div>
                  {r.commentaire && r.commentaire !== "RAS" && <div style={{ fontSize: 12.5, color: "#6b5544", marginTop: 3 }}>{r.commentaire}</div>}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Ajout */}
      <form onSubmit={ajouter} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4a3728", marginBottom: 10 }}>Consigner un fait</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={labelStyle}>Type / libellé *</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              {TYPES_SUIVI.map((t) => (
                <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, libelle: t }))}
                  style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--surface-border)", background: form.libelle === t ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: form.libelle === t ? "white" : "var(--muted)" }}>{t}</button>
              ))}
            </div>
            <input style={inputStyle} value={form.libelle} onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))} maxLength={100} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={labelStyle}>Points</label><input type="number" min="0" style={inputStyle} value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} placeholder="0" /></div>
            <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} /></div>
          </div>
          <div><label style={labelStyle}>Commentaire</label><textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={form.commentaire} onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))} placeholder="Détail du fait (optionnel)" /></div>
          {err && <div style={{ fontSize: 12, color: "#dc2626" }}>{err}</div>}
          <button type="submit" disabled={envoi} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 13, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <Plus size={14} /> {envoi ? "Enregistrement…" : "Consigner"}
          </button>
        </div>
      </form>
    </div>
  );
}

function btnStyle(actif) {
  return {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10,
    border: "1px solid var(--surface-border)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    background: actif ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)",
    color: actif ? "white" : "var(--orange)",
  };
}
