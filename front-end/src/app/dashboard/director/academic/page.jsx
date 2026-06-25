"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getCycles, getClasses, getCours, getSalles,
  createCycle, createClasse, createCours, createSalle, updateSalle,
} from "@/lib/api";
import { Layers, Plus } from "lucide-react";
import ManagerOnly from "@/components/ManagerOnly";

const thStyle = { padding: "14px 22px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "14px 22px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

export default function AcademicPageGuarded() {
  return <ManagerOnly><AcademicPage /></ManagerOnly>;
}

function AcademicPage() {
  const { user } = useAuth();
  const idAdmin = user?.role === "admin" && user?.id ? Number(user.id) : undefined;

  const [tab, setTab] = useState("cycles"); // 'cycles' | 'classes' | 'cours'
  const [cycles, setCycles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [cours, setCours] = useState([]);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Formulaires
  const [fCycle, setFCycle] = useState({ libelle: "", description: "" });
  const [fClasse, setFClasse] = useState({ libelle: "", idCycle: "" });
  const [fCours, setFCours] = useState({ libelle: "", description: "", coefficient: "1", idClasse: "" });
  const [fSalle, setFSalle] = useState({ libelle: "", surface: "", position: "", idClasse: "" });

  const charger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cy, cl, co, sa] = await Promise.all([getCycles(), getClasses(), getCours(), getSalles()]);
      setCycles(Array.isArray(cy) ? cy : []);
      setClasses(Array.isArray(cl) ? cl : []);
      setCours(Array.isArray(co) ? co : []);
      setSalles(Array.isArray(sa) ? sa : []);
    } catch (e) {
      setError(e.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ajouterCycle = async (e) => {
    e.preventDefault();
    if (!fCycle.libelle.trim()) return;
    setEnvoi(true); setError("");
    try {
      await createCycle({ libelle: fCycle.libelle.trim(), description: fCycle.description.trim() || "INDEFINI", idAdmin });
      setFCycle({ libelle: "", description: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de la création du cycle."); }
    finally { setEnvoi(false); }
  };

  const ajouterClasse = async (e) => {
    e.preventDefault();
    if (!fClasse.libelle.trim() || !fClasse.idCycle) { setError("Libellé et cycle requis."); return; }
    setEnvoi(true); setError("");
    try {
      await createClasse({ libelle: fClasse.libelle.trim(), idCycle: Number(fClasse.idCycle), idAdmin });
      setFClasse({ libelle: "", idCycle: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de la création de la classe."); }
    finally { setEnvoi(false); }
  };

  const ajouterCours = async (e) => {
    e.preventDefault();
    if (!fCours.libelle.trim() || !fCours.idClasse) { setError("Libellé et classe requis."); return; }
    setEnvoi(true); setError("");
    try {
      await createCours({
        libelle: fCours.libelle.trim(),
        description: fCours.description.trim() || "INDEFINI",
        coefficient: Number(fCours.coefficient) || 1,
        note: 0,
        idClasse: Number(fCours.idClasse),
        idAdmin,
      });
      setFCours({ libelle: "", description: "", coefficient: "1", idClasse: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de la création du cours."); }
    finally { setEnvoi(false); }
  };

  const ajouterSalle = async (e) => {
    e.preventDefault();
    if (!fSalle.libelle.trim() || !fSalle.idClasse) { setError("Libellé et classe requis."); return; }
    setEnvoi(true); setError("");
    try {
      await createSalle({
        libelle: fSalle.libelle.trim(),
        surface: fSalle.surface.trim() || "INDEFINI",
        position: fSalle.position.trim() || "INDEFINI",
        idClasse: Number(fSalle.idClasse),
        idAdmin,
      });
      setFSalle({ libelle: "", surface: "", position: "", idClasse: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de la création de la salle."); }
    finally { setEnvoi(false); }
  };

  // Changer la classe d'une salle existante
  const changerClasseSalle = async (idSalle, idClasse) => {
    if (!idClasse) return;
    setEnvoi(true); setError("");
    try {
      await updateSalle(idSalle, { idClasse: Number(idClasse) });
      await charger();
    } catch (err) { setError(err.message || "Échec du changement de classe."); }
    finally { setEnvoi(false); }
  };

  const tabs = [
    { key: "cycles", label: "Cycles", count: cycles.length },
    { key: "classes", label: "Classes", count: classes.length },
    { key: "cours", label: "Cours", count: cours.length },
    { key: "salles", label: "Salles", count: salles.length },
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Layers size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Cours & Classes</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)", boxShadow: active ? "0 4px 12px rgba(216,99,16,0.25)" : "none" }}>
              {tb.label}
              <span style={{ padding: "1px 8px", borderRadius: 999, fontSize: 12, background: active ? "rgba(255,255,255,0.25)" : "rgba(216,99,16,0.1)", color: active ? "white" : "var(--orange)" }}>{tb.count}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Liste */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
          ) : tab === "cycles" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Cycle</th><th style={thStyle}>Description</th></tr></thead>
              <tbody>
                {cycles.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={2}>Aucun cycle.</td></tr> :
                  cycles.map((c) => (
                    <tr key={c.idCycle}><td style={{ ...tdStyle, fontWeight: 600 }}>{c.libelle}</td><td style={{ ...tdStyle, color: "var(--muted)" }}>{c.description && c.description !== "INDEFINI" ? c.description : "—"}</td></tr>
                  ))}
              </tbody>
            </table>
          ) : tab === "classes" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Classe</th><th style={thStyle}>Cycle</th></tr></thead>
              <tbody>
                {classes.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={2}>Aucune classe.</td></tr> :
                  classes.map((c) => (
                    <tr key={c.idClasse}><td style={{ ...tdStyle, fontWeight: 600 }}>{c.libelle}</td><td style={{ ...tdStyle, color: "var(--muted)" }}>{c.cycle?.libelle || "—"}</td></tr>
                  ))}
              </tbody>
            </table>
          ) : tab === "cours" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Cours</th><th style={thStyle}>Classe</th><th style={thStyle}>Coef.</th></tr></thead>
              <tbody>
                {cours.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={3}>Aucun cours.</td></tr> :
                  cours.map((c) => (
                    <tr key={c.idCours}><td style={{ ...tdStyle, fontWeight: 600 }}>{c.libelle}</td><td style={{ ...tdStyle, color: "var(--muted)" }}>{c.classe?.libelle || "—"}</td><td style={{ ...tdStyle, color: "var(--muted)" }}>{c.coefficient}</td></tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Salle</th><th style={thStyle}>Classe</th><th style={thStyle}>Surface</th></tr></thead>
              <tbody>
                {salles.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={3}>Aucune salle.</td></tr> :
                  salles.map((s) => (
                    <tr key={s.idSalle}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{s.libelle}</td>
                      <td style={tdStyle}>
                        <select
                          value={s.classe?.idClasse ?? ""}
                          disabled={envoi}
                          onChange={(e) => changerClasseSalle(s.idSalle, e.target.value)}
                          style={{ ...inputStyle, padding: "7px 10px", maxWidth: 180 }}
                          title="Changer la classe de cette salle"
                        >
                          <option value="">— Sans classe —</option>
                          {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                        </select>
                      </td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{s.surface && s.surface !== "INDEFINI" ? s.surface : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulaire d'ajout selon l'onglet */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={18} style={{ color: "var(--orange)" }} />
            {tab === "cycles" ? "Nouveau cycle" : tab === "classes" ? "Nouvelle classe" : tab === "cours" ? "Nouveau cours" : "Nouvelle salle"}
          </h3>

          {tab === "cycles" && (
            <form onSubmit={ajouterCycle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fCycle.libelle} onChange={(e) => setFCycle((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Primaire" /></div>
              <div><label style={labelStyle}>Description</label><input style={inputStyle} value={fCycle.description} onChange={(e) => setFCycle((s) => ({ ...s, description: e.target.value }))} placeholder="Optionnel" /></div>
              <SubmitBtn envoi={envoi} />
            </form>
          )}

          {tab === "classes" && (
            <form onSubmit={ajouterClasse} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fClasse.libelle} onChange={(e) => setFClasse((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : CM2 A" /></div>
              <div>
                <label style={labelStyle}>Cycle *</label>
                <select style={inputStyle} value={fClasse.idCycle} onChange={(e) => setFClasse((s) => ({ ...s, idCycle: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {cycles.map((c) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                </select>
              </div>
              <SubmitBtn envoi={envoi} disabled={cycles.length === 0} hint={cycles.length === 0 ? "Crée d'abord un cycle." : ""} />
            </form>
          )}

          {tab === "cours" && (
            <form onSubmit={ajouterCours} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fCours.libelle} onChange={(e) => setFCours((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Mathématiques" /></div>
              <div>
                <label style={labelStyle}>Classe *</label>
                <select style={inputStyle} value={fCours.idClasse} onChange={(e) => setFCours((s) => ({ ...s, idClasse: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Coefficient</label><input type="number" min="0" step="0.5" style={inputStyle} value={fCours.coefficient} onChange={(e) => setFCours((s) => ({ ...s, coefficient: e.target.value }))} /></div>
              </div>
              <div><label style={labelStyle}>Description</label><input style={inputStyle} value={fCours.description} onChange={(e) => setFCours((s) => ({ ...s, description: e.target.value }))} placeholder="Optionnel" /></div>
              <SubmitBtn envoi={envoi} disabled={classes.length === 0} hint={classes.length === 0 ? "Crée d'abord une classe." : ""} />
            </form>
          )}

          {tab === "salles" && (
            <form onSubmit={ajouterSalle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fSalle.libelle} onChange={(e) => setFSalle((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Salle 101" /></div>
              <div>
                <label style={labelStyle}>Classe *</label>
                <select style={inputStyle} value={fSalle.idClasse} onChange={(e) => setFSalle((s) => ({ ...s, idClasse: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Surface</label><input style={inputStyle} value={fSalle.surface} onChange={(e) => setFSalle((s) => ({ ...s, surface: e.target.value }))} placeholder="ex : 48m²" /></div>
                <div><label style={labelStyle}>Position</label><input style={inputStyle} value={fSalle.position} onChange={(e) => setFSalle((s) => ({ ...s, position: e.target.value }))} placeholder="Optionnel" /></div>
              </div>
              <SubmitBtn envoi={envoi} disabled={classes.length === 0} hint={classes.length === 0 ? "Crée d'abord une classe." : ""} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitBtn({ envoi, disabled, hint }) {
  return (
    <div>
      <button type="submit" disabled={envoi || disabled} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: (envoi || disabled) ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: (envoi || disabled) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
        {envoi ? "Ajout…" : "Ajouter"}
      </button>
      {hint && <p style={{ fontSize: 12, color: "#8a7060", marginTop: 8 }}>{hint}</p>}
    </div>
  );
}
