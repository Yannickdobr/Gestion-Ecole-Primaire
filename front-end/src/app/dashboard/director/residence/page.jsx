"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  getQuartiers, createQuartier, deleteQuartier,
  getResidents, createResident, deleteResident, getPersonnesTous,
} from "@/lib/api";
import { MapPin, Plus, Trash2, Home } from "lucide-react";

const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 5 };

export default function ResidencePage() {
  const [tab, setTab] = useState("quartiers");
  const [quartiers, setQuartiers] = useState([]);
  const [residents, setResidents] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const [fQ, setFQ] = useState({ libelle: "", description: "" });
  const [fR, setFR] = useState({ idPers: "", idQuartier: "", description: "" });

  const charger = useCallback(async () => {
    setError("");
    try {
      const [q, r, p] = await Promise.all([
        getQuartiers().catch(() => []),
        getResidents().catch(() => []),
        getPersonnesTous().catch(() => []),
      ]);
      setQuartiers(Array.isArray(q) ? q : []);
      setResidents(Array.isArray(r) ? r : []);
      setPersonnes(Array.isArray(p) ? p : []);
    } catch (e) { setError(e.message || "Erreur de chargement."); }
  }, []);
  useEffect(() => { charger(); }, [charger]);

  const ajouterQuartier = async (e) => {
    e.preventDefault(); setError("");
    if (!fQ.libelle.trim()) { setError("Libellé du quartier requis."); return; }
    setEnvoi(true);
    try {
      await createQuartier({ libelle: fQ.libelle.trim(), description: fQ.description.trim() || undefined });
      setFQ({ libelle: "", description: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec."); } finally { setEnvoi(false); }
  };

  const ajouterResident = async (e) => {
    e.preventDefault(); setError("");
    if (!fR.idPers || !fR.idQuartier) { setError("Choisis une personne et un quartier."); return; }
    setEnvoi(true);
    try {
      await createResident({ idPers: Number(fR.idPers), idQuartier: Number(fR.idQuartier), description: fR.description.trim() || undefined });
      setFR({ idPers: "", idQuartier: "", description: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec."); } finally { setEnvoi(false); }
  };

  const supprQuartier = async (id) => { setEnvoi(true); try { await deleteQuartier(id); await charger(); } catch (e) { setError(e.message); } finally { setEnvoi(false); } };
  const supprResident = async (id) => { setEnvoi(true); try { await deleteResident(id); await charger(); } catch (e) { setError(e.message); } finally { setEnvoi(false); } };

  const tabs = [{ key: "quartiers", label: "Quartiers" }, { key: "residents", label: "Résidents" }];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <MapPin size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Résidence</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return <button key={tb.key} onClick={() => setTab(tb.key)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)" }}>{tb.label}</button>;
        })}
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {tab === "quartiers" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Quartier</th><th style={thStyle}>Description</th><th style={{ ...thStyle, width: 50 }}></th></tr></thead>
              <tbody>
                {quartiers.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={3}>Aucun quartier.</td></tr> :
                  quartiers.map((q) => (
                    <tr key={q.idQuartier}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{q.libelle}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{q.description && q.description !== "INDEFINI" ? q.description : "—"}</td>
                      <td style={tdStyle}><button onClick={() => supprQuartier(q.idQuartier)} disabled={envoi} style={{ padding: 5, borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={ajouterQuartier} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Ajouter un quartier</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fQ.libelle} onChange={(e) => setFQ((f) => ({ ...f, libelle: e.target.value }))} placeholder="ex : Bonamoussadi" /></div>
              <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={fQ.description} onChange={(e) => setFQ((f) => ({ ...f, description: e.target.value }))} /></div>
              <button type="submit" disabled={envoi} style={{ padding: "10px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "…" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      {tab === "residents" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Personne</th><th style={thStyle}>Quartier</th><th style={{ ...thStyle, width: 50 }}></th></tr></thead>
              <tbody>
                {residents.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={3}>Aucun résident enregistré.</td></tr> :
                  residents.map((r) => (
                    <tr key={r.idResi}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.personne?.prenom} {r.personne?.nom}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}><Home size={13} style={{ color: "var(--orange)", marginRight: 6, verticalAlign: "middle" }} />{r.quartier?.libelle || "—"}</td>
                      <td style={tdStyle}><button onClick={() => supprResident(r.idResi)} disabled={envoi} style={{ padding: 5, borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={ajouterResident} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Rattacher à un quartier</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Personne *</label>
                <select style={inputStyle} value={fR.idPers} onChange={(e) => setFR((f) => ({ ...f, idPers: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quartier *</label>
                <select style={inputStyle} value={fR.idQuartier} onChange={(e) => setFR((f) => ({ ...f, idQuartier: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {quartiers.map((q) => <option key={q.idQuartier} value={q.idQuartier}>{q.libelle}</option>)}
                </select>
                {quartiers.length === 0 && <p style={{ fontSize: 12, color: "#8a7060", marginTop: 6 }}>Crée d'abord un quartier (onglet Quartiers).</p>}
              </div>
              <div><label style={labelStyle}>Précision (rue, repère…)</label><input style={inputStyle} value={fR.description} onChange={(e) => setFR((f) => ({ ...f, description: e.target.value }))} /></div>
              <button type="submit" disabled={envoi || quartiers.length === 0} style={{ padding: "10px", borderRadius: 10, border: "none", background: (envoi || quartiers.length === 0) ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: (envoi || quartiers.length === 0) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "…" : "Rattacher"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
