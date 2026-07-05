"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  getEleves, getRapportsEleve, getParentsEleve,
  getJustificatifsByRapport, validerJustificatif, deleteJustificatif,
} from "@/lib/api";
import { FileCheck, Check, Trash2, Paperclip, Users2 } from "lucide-react";

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid var(--surface-border)", fontSize: 13.5, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 600, color: "#4a3728", marginBottom: 4 };

export default function JustificatifsPage() {
  const [eleves, setEleves] = useState([]);
  const [matricule, setMatricule] = useState("");
  const [rapports, setRapports] = useState(null);
  const [parents, setParents] = useState([]);

  useEffect(() => {
    getEleves().then((e) => setEleves(Array.isArray(e) ? e : [])).catch(() => setEleves([]));
  }, []);

  const charger = async (mat) => {
    setMatricule(mat); setRapports(null); setParents([]);
    if (!mat) return;
    try { const r = await getRapportsEleve(mat); setRapports(Array.isArray(r) ? r : []); }
    catch { setRapports([]); }
    try { const p = await getParentsEleve(mat); setParents(Array.isArray(p) ? p : []); }
    catch { setParents([]); }
  };

  const nomsParents = parents.map((p) => `${p.personne?.prenom ?? ""} ${p.personne?.nom ?? ""}`.trim()).filter(Boolean);

  return (
    <div style={{ maxWidth: 950, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <FileCheck size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Justificatifs d'absence</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Consultez et validez les justificatifs transmis par les parents. Le dépôt se fait depuis l'espace Parent.</p>

      <div style={{ maxWidth: 360, marginBottom: 14 }}>
        <label style={labelStyle}>Élève</label>
        <select style={inputStyle} value={matricule} onChange={(e) => charger(e.target.value)}>
          <option value="">— Sélectionner un élève —</option>
          {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
        </select>
      </div>

      {matricule && nomsParents.length > 0 && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22, padding: "8px 14px", borderRadius: 999, background: "rgba(216,99,16,0.08)", color: "#6b5544", fontSize: 13 }}>
          <Users2 size={15} style={{ color: "var(--orange)" }} />
          Parent(s) : <b>{nomsParents.join(", ")}</b>
        </div>
      )}

      {matricule && (
        !rapports ? <div style={{ padding: 30, color: "var(--muted)" }}>Chargement…</div>
        : rapports.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18 }}>
            Aucun fait consigné pour cet élève. Les justificatifs se rattachent à un fait (onglet « Discipline »).
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {rapports.map((r) => <RapportCard key={r.idRap} rapport={r} nomsParents={nomsParents} />)}
          </div>
        )
      )}
    </div>
  );
}

function RapportCard({ rapport, nomsParents }) {
  const [justifs, setJustifs] = useState(null);
  const [busy, setBusy] = useState(false);

  const recharger = async () => {
    try { const j = await getJustificatifsByRapport(rapport.idRap); setJustifs(Array.isArray(j) ? j : []); }
    catch { setJustifs([]); }
  };
  useEffect(() => { recharger(); /* eslint-disable-next-line */ }, [rapport.idRap]);

  const valider = async (id) => { setBusy(true); try { await validerJustificatif(id); await recharger(); } finally { setBusy(false); } };
  const supprimer = async (id) => { setBusy(true); try { await deleteJustificatif(id); await recharger(); } finally { setBusy(false); } };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{rapport.libelle}</span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{rapport.event_date ? new Date(rapport.event_date).toLocaleDateString("fr-FR") : ""}</span>
        {rapport.commentaire && rapport.commentaire !== "RAS" && <span style={{ fontSize: 12.5, color: "#6b5544" }}>· {rapport.commentaire}</span>}
      </div>

      {!justifs ? <div style={{ fontSize: 13, color: "var(--muted)" }}>Chargement…</div>
        : justifs.length === 0 ? <div style={{ fontSize: 13, color: "var(--muted)" }}>Aucun justificatif transmis par le parent pour ce fait.</div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {justifs.map((j) => (
              <div key={j.ID} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#faf9f7", border: "1px solid var(--surface-border)" }}>
                <Paperclip size={14} style={{ color: "var(--orange)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--text-dark)" }}>{j.commentaire && j.commentaire !== "RAS" ? j.commentaire : "(sans note)"}</div>
                  {nomsParents.length > 0 && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Transmis par : {nomsParents.join(", ")}</div>}
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
    </div>
  );
}
