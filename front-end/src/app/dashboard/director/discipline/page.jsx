"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { getEleves, getAnnees, getRapportsEleve, createRapport, getJustificatifs } from "@/lib/api";
import { ShieldAlert, Plus, CheckCircle2 } from "lucide-react";

const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 5 };

const TYPES = ["Avertissement", "Absence", "Retard", "Exclusion", "Encouragement"];

export default function DisciplinePage() {
  const { user } = useAuth();
  const [eleves, setEleves] = useState([]);
  const [matricule, setMatricule] = useState("");
  const [idAca, setIdAca] = useState(null);
  const [rapports, setRapports] = useState(null);
  const [justifies, setJustifies] = useState(new Set()); // idRapport ayant un justificatif VALIDÉ
  const [form, setForm] = useState({ libelle: "Avertissement", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
  const [envoi, setEnvoi] = useState(false);
  const [error, setError] = useState("");

  const chargerJustifies = async () => {
    try {
      const js = await getJustificatifs();
      const set = new Set();
      (Array.isArray(js) ? js : []).forEach((j) => { if (j.idDirecteur) set.add(Number(j.idRapport)); });
      setJustifies(set);
    } catch { /* pas bloquant */ }
  };

  useEffect(() => {
    getEleves().then((e) => setEleves(Array.isArray(e) ? e : [])).catch(() => setEleves([]));
    getAnnees().then((a) => {
      const recente = (Array.isArray(a) ? a : []).reduce((acc, x) => (!acc || Number(x.idAnnee) > Number(acc.idAnnee) ? x : acc), null);
      setIdAca(recente?.idAnnee ?? null);
    }).catch(() => {});
    chargerJustifies();
  }, []);

  const charger = async (mat) => {
    setMatricule(mat); setRapports(null);
    if (!mat) return;
    try { const r = await getRapportsEleve(mat); setRapports(Array.isArray(r) ? r : []); }
    catch { setRapports([]); }
    chargerJustifies();
  };

  const ajouter = async (e) => {
    e.preventDefault(); setError("");
    if (!matricule) { setError("Sélectionne un élève."); return; }
    if (!form.libelle.trim()) { setError("Le libellé est requis."); return; }
    if (!idAca) { setError("Aucune année académique en base."); return; }
    setEnvoi(true);
    try {
      await createRapport({
        libelle: form.libelle.trim(),
        points: form.points === "" ? 0 : Number(form.points),
        commentaire: form.commentaire.trim() || undefined,
        event_date: form.event_date || undefined,
        matricule: Number(matricule),
        idAca: Number(idAca),
        idPers: user?.role === "personne" && user?.id ? Number(user.id) : undefined,
      });
      setForm({ libelle: "Avertissement", points: "", commentaire: "", event_date: new Date().toISOString().slice(0, 10) });
      const r = await getRapportsEleve(matricule);
      setRapports(Array.isArray(r) ? r : []);
    } catch (err) { setError(err.message || "Échec de l'enregistrement."); }
    finally { setEnvoi(false); }
  };

  return (
    <div style={{ maxWidth: 1050, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <ShieldAlert size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Discipline</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Faits consignés par élève : sanctions, absences, encouragements.</p>

      <div style={{ maxWidth: 360, marginBottom: 22 }}>
        <label style={labelStyle}>Élève</label>
        <select style={inputStyle} value={matricule} onChange={(e) => charger(e.target.value)}>
          <option value="">— Sélectionner un élève —</option>
          {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
        </select>
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {matricule && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Historique */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--surface-border)", fontSize: 14, fontWeight: 700 }}>Historique</div>
            {!rapports ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Chargement…</div>
              : rapports.length === 0 ? <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Aucun fait consigné.</div>
              : (
                <div style={{ maxHeight: 420, overflowY: "auto" }}>
                  {rapports.map((r) => (
                    <div key={r.idRap} style={{ padding: "12px 18px", borderBottom: "1px solid var(--surface-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{r.libelle}</span>
                        {Number(r.points) > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{r.points} pt(s)</span>}
                        {justifies.has(Number(r.idRap)) && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, background: "rgba(22,163,74,0.12)", color: "#16a34a" }}><CheckCircle2 size={12} /> Justifié</span>}
                        <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: "auto" }}>{r.event_date ? new Date(r.event_date).toLocaleDateString("fr-FR") : ""}</span>
                      </div>
                      {r.commentaire && r.commentaire !== "RAS" && <div style={{ fontSize: 12.5, color: "#6b5544", marginTop: 3 }}>{r.commentaire}</div>}
                      {r.redacteur && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>par {r.redacteur.prenom} {r.redacteur.nom}</div>}
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Ajout */}
          <form onSubmit={ajouter} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Consigner un fait</h3>
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
                <div><label style={labelStyle}>Points</label><input type="number" min="0" style={inputStyle} value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} placeholder="0" /></div>
                <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} value={form.event_date} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))} /></div>
              </div>
              <div><label style={labelStyle}>Commentaire</label><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.commentaire} onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))} placeholder="Détail (optionnel)" /></div>
              <button type="submit" disabled={envoi} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                <Plus size={15} /> {envoi ? "Enregistrement…" : "Consigner"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
