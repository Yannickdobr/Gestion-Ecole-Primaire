"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getEnseignants, getAnnees, getFichesEnseignant, createFicheEnseignant, deleteFicheEnseignant, getCours, setMatiereDifficulte, getTitulaires } from "@/lib/api";
import { ClipboardList, Plus, Trash2, Repeat } from "lucide-react";

const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 5 };

const TYPES = ["Évaluation", "Félicitation", "Avertissement", "Formation", "Observation"];

export default function RhPage() {
  const [enseignants, setEnseignants] = useState([]);
  const [titulaires, setTitulaires] = useState([]);
  const [idEnseignant, setIdEnseignant] = useState("");
  const [idAca, setIdAca] = useState(null);
  const [fiches, setFiches] = useState(null);
  const [form, setForm] = useState({ libelle: "Évaluation", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
  const [envoi, setEnvoi] = useState(false);
  const [error, setError] = useState("");
  // Matière de difficulté (intérim)
  const [ensCourant, setEnsCourant] = useState(null);
  const [coursClasse, setCoursClasse] = useState([]);
  const [difficulteSel, setDifficulteSel] = useState("");
  const [savingDiff, setSavingDiff] = useState(false);

  // Classe d'un enseignant dérivée du titulariat (idPers -> salle -> classe)
  const classeDeEns = (ens) => {
    if (!ens) return null;
    const t = titulaires.find((tt) => Number(tt.personne?.idPers) === Number(ens.personne?.idPers) && Number(tt.actif) === 1);
    return t?.salle?.classe || null;
  };

  useEffect(() => {
    getEnseignants().then((e) => setEnseignants(Array.isArray(e) ? e : [])).catch(() => setEnseignants([]));
    getTitulaires().then((t) => setTitulaires(Array.isArray(t) ? t : [])).catch(() => setTitulaires([]));
    getAnnees().then((a) => {
      const recente = (Array.isArray(a) ? a : []).reduce((acc, x) => (!acc || Number(x.idAnnee) > Number(acc.idAnnee) ? x : acc), null);
      setIdAca(recente?.idAnnee ?? null);
    }).catch(() => {});
  }, []);

  const charger = async (id) => {
    setIdEnseignant(id); setFiches(null); setError("");
    setEnsCourant(null); setCoursClasse([]); setDifficulteSel("");
    if (!id) return;
    try { const f = await getFichesEnseignant(id); setFiches(Array.isArray(f) ? f : []); }
    catch { setFiches([]); }
    // Matière de difficulté : charge les cours de la classe de l'enseignant
    const ens = enseignants.find((e) => Number(e.idEnseignant) === Number(id));
    setEnsCourant(ens || null);
    setDifficulteSel(ens?.cours?.idCours ? String(ens.cours.idCours) : "");
    const classe = classeDeEns(ens);
    if (classe?.idClasse) {
      try { const cc = await getCours(); setCoursClasse(Array.isArray(cc) ? cc : []); }
      catch { setCoursClasse([]); }
    }
  };

  const enregistrerDifficulte = async () => {
    if (!idEnseignant) return;
    setSavingDiff(true); setError("");
    try {
      await setMatiereDifficulte(Number(idEnseignant), difficulteSel ? Number(difficulteSel) : null);
      // recharge la liste des enseignants pour refléter le changement
      const list = await getEnseignants().catch(() => enseignants);
      setEnseignants(Array.isArray(list) ? list : enseignants);
    } catch (err) { setError(err.message || "Échec de l'enregistrement de la matière de difficulté."); }
    finally { setSavingDiff(false); }
  };

  const ajouter = async (e) => {
    e.preventDefault(); setError("");
    if (!idEnseignant) { setError("Sélectionne un enseignant."); return; }
    if (!form.libelle.trim()) { setError("Le libellé est requis."); return; }
    if (!idAca) { setError("Aucune année académique en base."); return; }
    setEnvoi(true);
    try {
      await createFicheEnseignant({
        idEnseignant: Number(idEnseignant),
        idAca: Number(idAca),
        libelle: form.libelle.trim(),
        points: form.points === "" ? 0 : Number(form.points),
        commentaire: form.commentaire.trim() || undefined,
        event_date: form.event_date || undefined,
      });
      setForm({ libelle: "Évaluation", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
      const f = await getFichesEnseignant(idEnseignant);
      setFiches(Array.isArray(f) ? f : []);
    } catch (err) { setError(err.message || "Échec de l'enregistrement."); }
    finally { setEnvoi(false); }
  };

  const supprimer = async (idRap) => {
    setEnvoi(true);
    try { await deleteFicheEnseignant(idRap); const f = await getFichesEnseignant(idEnseignant); setFiches(Array.isArray(f) ? f : []); }
    catch (err) { setError(err.message || "Suppression impossible."); }
    finally { setEnvoi(false); }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <ClipboardList size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Suivi RH des enseignants</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Fiches de suivi : évaluations, félicitations, avertissements, formations.</p>

      <div style={{ maxWidth: 380, marginBottom: 22 }}>
        <label style={labelStyle}>Enseignant</label>
        <select style={inputStyle} value={idEnseignant} onChange={(e) => charger(e.target.value)}>
          <option value="">— Sélectionner un enseignant —</option>
          {enseignants.map((en) => (
            <option key={en.idEnseignant} value={en.idEnseignant}>
              {en.personne?.prenom} {en.personne?.nom}{classeDeEns(en) ? ` · ${classeDeEns(en).libelle}` : ""}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {idEnseignant && ensCourant && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20, marginBottom: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Repeat size={16} style={{ color: "var(--orange)" }} /> Matière de difficulté (intérim)</h3>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12 }}>La matière que cet enseignant n'assure pas dans sa classe <b>{classeDeEns(ensCourant)?.libelle || "—"}</b> — un intérimaire libre viendra la couvrir automatiquement (échange de créneau).</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ minWidth: 260 }}>
              <label style={labelStyle}>Matière (parmi les cours de sa classe)</label>
              <select style={inputStyle} value={difficulteSel} onChange={(e) => setDifficulteSel(e.target.value)}>
                <option value="">— Aucune (il assure tout) —</option>
                {coursClasse.map((c) => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
              </select>
              {coursClasse.length === 0 && <p style={{ fontSize: 11, color: "#8a7060", marginTop: 5 }}>Aucun cours pour sa classe (Académique → Cours).</p>}
            </div>
            <button onClick={enregistrerDifficulte} disabled={savingDiff} style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: savingDiff ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: savingDiff ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{savingDiff ? "Enregistrement…" : "Enregistrer"}</button>
          </div>
        </div>
      )}

      {idEnseignant && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--surface-border)", fontSize: 14, fontWeight: 700 }}>Historique des fiches</div>
            {!fiches ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
              : fiches.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Aucune fiche.</div>
              : (
                <div style={{ maxHeight: 440, overflowY: "auto" }}>
                  {fiches.map((f) => (
                    <div key={f.idRap} style={{ padding: "12px 18px", borderBottom: "1px solid var(--surface-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{f.libelle}</span>
                        {Number(f.points) !== 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{f.points} pt(s)</span>}
                        <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{f.event_date ? new Date(f.event_date).toLocaleDateString("fr-FR") : ""}</span>
                        <button onClick={() => supprimer(f.idRap)} disabled={envoi} title="Supprimer" style={{ marginLeft: "auto", padding: 5, borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={13} /></button>
                      </div>
                      {f.commentaire && f.commentaire !== "RAS" && <div style={{ fontSize: 12.5, color: "#6b5544", marginTop: 3 }}>{f.commentaire}</div>}
                    </div>
                  ))}
                </div>
              )}
          </div>

          <form onSubmit={ajouter} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Nouvelle fiche</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Type / libellé *</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {TYPES.map((t) => (
                    <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, libelle: t }))}
                      style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", border: "1px solid var(--surface-border)", background: form.libelle === t ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: form.libelle === t ? "white" : "var(--muted)" }}>{t}</button>
                  ))}
                </div>
                <input style={inputStyle} value={form.libelle} onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))} maxLength={100} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Points</label><input type="number" style={inputStyle} value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} placeholder="0" /></div>
                <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} /></div>
              </div>
              <div><label style={labelStyle}>Commentaire</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.commentaire} onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))} placeholder="Détail (optionnel)" /></div>
              <button type="submit" disabled={envoi} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                <Plus size={15} /> {envoi ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
