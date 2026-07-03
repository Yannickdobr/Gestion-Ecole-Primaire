"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  getEleves, getRapportsEleve,
  getJustificatifsByRapport, createJustificatif, validerJustificatif, deleteJustificatif,
} from "@/lib/api";
import { FileCheck, Plus, Check, Trash2, Paperclip } from "lucide-react";

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid var(--surface-border)", fontSize: 13.5, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 600, color: "#4a3728", marginBottom: 4 };

export default function JustificatifsPage() {
  const [eleves, setEleves] = useState([]);
  const [matricule, setMatricule] = useState("");
  const [rapports, setRapports] = useState(null);

  useEffect(() => {
    getEleves().then((e) => setEleves(Array.isArray(e) ? e : [])).catch(() => setEleves([]));
  }, []);

  const charger = async (mat) => {
    setMatricule(mat); setRapports(null);
    if (!mat) return;
    try { const r = await getRapportsEleve(mat); setRapports(Array.isArray(r) ? r : []); }
    catch { setRapports([]); }
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <FileCheck size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Justificatifs d'absence</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Pièces justificatives rattachées aux faits consignés (absences, retards…).</p>

      <div style={{ maxWidth: 360, marginBottom: 22 }}>
        <label style={labelStyle}>Élève</label>
        <select style={inputStyle} value={matricule} onChange={(e) => charger(e.target.value)}>
          <option value="">— Sélectionner un élève —</option>
          {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
        </select>
      </div>

      {matricule && (
        !rapports ? <div style={{ padding: 30, color: "var(--muted)" }}>Chargement…</div>
        : rapports.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18 }}>
            Aucun fait consigné pour cet élève. Les justificatifs se rattachent à un fait (onglet « Discipline »).
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rapports.map((r) => <RapportCard key={r.idRap} rapport={r} />)}
          </div>
        )
      )}
    </div>
  );
}

function RapportCard({ rapport }) {
  const [justifs, setJustifs] = useState(null);
  const [form, setForm] = useState({ commentaire: "", urlDoc: "" });
  const [busy, setBusy] = useState(false);

  const recharger = async () => {
    try { const j = await getJustificatifsByRapport(rapport.idRap); setJustifs(Array.isArray(j) ? j : []); }
    catch { setJustifs([]); }
  };
  useEffect(() => { recharger(); /* eslint-disable-next-line */ }, [rapport.idRap]);

  const ajouter = async (e) => {
    e.preventDefault();
    if (!form.commentaire.trim() && !form.urlDoc.trim()) return;
    setBusy(true);
    try {
      await createJustificatif({ idRapport: rapport.idRap, commentaire: form.commentaire.trim() || undefined, urlDoc: form.urlDoc.trim() || undefined });
      setForm({ commentaire: "", urlDoc: "" });
      await recharger();
    } finally { setBusy(false); }
  };
  const valider = async (id) => { setBusy(true); try { await validerJustificatif(id); await recharger(); } finally { setBusy(false); } };
  const supprimer = async (id) => { setBusy(true); try { await deleteJustificatif(id); await recharger(); } finally { setBusy(false); } };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{rapport.libelle}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{rapport.event_date ? new Date(rapport.event_date).toLocaleDateString("fr-FR") : ""}</span>
        {rapport.commentaire && rapport.commentaire !== "RAS" && <span style={{ fontSize: 12.5, color: "#6b5544" }}>· {rapport.commentaire}</span>}
      </div>

      {/* Justificatifs existants */}
      {!justifs ? <div style={{ fontSize: 13, color: "var(--muted)" }}>Chargement…</div>
        : justifs.length === 0 ? <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Aucun justificatif déposé.</div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {justifs.map((j) => (
              <div key={j.ID} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#faf9f7", border: "1px solid var(--surface-border)" }}>
                <Paperclip size={14} style={{ color: "var(--orange)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--text-dark)" }}>{j.commentaire && j.commentaire !== "RAS" ? j.commentaire : "(sans note)"}</div>
                  {j.urlDoc && <a href={j.urlDoc} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--orange)" }}>{j.urlDoc}</a>}
                </div>
                {j.idDirecteur
                  ? <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>Validé</span>
                  : <button onClick={() => valider(j.ID)} disabled={busy} title="Valider" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 9, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#16a34a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}><Check size={13} /> Valider</button>}
                <button onClick={() => supprimer(j.ID)} disabled={busy} title="Supprimer" style={{ padding: 5, borderRadius: 9, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}

      {/* Ajout */}
      <form onSubmit={ajouter} style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 8, alignItems: "end" }}>
        <div><label style={labelStyle}>Motif / note</label><input style={inputStyle} value={form.commentaire} onChange={(e) => setForm((f) => ({ ...f, commentaire: e.target.value }))} placeholder="ex : certificat médical" /></div>
        <div><label style={labelStyle}>Lien du document</label><input style={inputStyle} value={form.urlDoc} onChange={(e) => setForm((f) => ({ ...f, urlDoc: e.target.value }))} placeholder="https://… (optionnel)" /></div>
        <button type="submit" disabled={busy} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none", background: busy ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}><Plus size={14} /> Déposer</button>
      </form>
    </div>
  );
}
