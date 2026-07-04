"use client";

import { useEffect, useState } from "react";
import { getEleves, getParentsEleve, getAnnees, envoyerMessage } from "@/lib/api";
import { Megaphone, Send } from "lucide-react";

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

export default function ConvocationsPage() {
  const [eleves, setEleves] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [matricule, setMatricule] = useState("");
  const [parents, setParents] = useState([]);
  const [idParent, setIdParent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [motif, setMotif] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getEleves().then((e) => setEleves(Array.isArray(e) ? e : [])).catch(() => {});
    getAnnees().then((a) => setAnnees(Array.isArray(a) ? a : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setIdParent(""); setParents([]);
    if (!matricule) return;
    getParentsEleve(matricule)
      .then((p) => {
        const arr = Array.isArray(p) ? p : [];
        setParents(arr);
        if (arr.length === 1) setIdParent(String(arr[0].idParent));
      })
      .catch(() => setParents([]));
  }, [matricule]);

  const anneeActive = annees.reduce((a, c) => (!a || Number(c.idAnnee) > Number(a.idAnnee) ? c : a), null);
  const eleve = eleves.find((e) => String(e.matricule) === String(matricule));

  const envoyer = async (ev) => {
    ev.preventDefault();
    setInfo(""); setError("");
    if (!idParent) { setError("Sélectionne l'élève et le parent destinataire."); return; }
    if (!motif.trim()) { setError("Indique le motif de la convocation."); return; }
    setBusy(true);
    try {
      await envoyerMessage({
        objet: `Convocation — ${eleve ? eleve.prenom + " " + eleve.nom : "élève"}`,
        information: `Vous êtes prié(e) de vous présenter à l'établissement le ${new Date(date).toLocaleDateString("fr-FR")}.\nMotif : ${motif.trim()}`,
        type_message: 0,
        idParent: Number(idParent),
        AnneeAcade: anneeActive?.libelle || "",
      });
      setInfo("Convocation envoyée au parent (visible dans sa messagerie).");
      setMotif("");
    } catch (e) { setError(e.message || "Échec de l'envoi."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <Megaphone size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Convocations</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Convoquer le parent d'un élève. La convocation arrive dans la messagerie du parent.</p>

      <form onSubmit={envoyer} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={labelStyle}>Élève</label>
            <select style={inputStyle} value={matricule} onChange={(e) => setMatricule(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {eleves.map((e) => <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom} (#{e.matricule})</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={labelStyle}>Parent destinataire</label>
            <select style={inputStyle} value={idParent} onChange={(e) => setIdParent(e.target.value)} disabled={!parents.length}>
              <option value="">{parents.length ? "— Sélectionner —" : "Choisis d'abord un élève"}</option>
              {parents.map((p) => <option key={p.idParent} value={p.idParent}>{p.personne?.prenom} {p.personne?.nom}</option>)}
            </select>
          </div>
        </div>
        <div style={{ maxWidth: 220 }}>
          <label style={labelStyle}>Date de convocation</label>
          <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Motif</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. Entretien concernant le comportement de l'élève, absences répétées…" maxLength={500} />
        </div>
        {error && <div style={{ fontSize: 13, color: "#dc2626" }}>{error}</div>}
        {info && <div style={{ fontSize: 13, color: "#16a34a" }}>{info}</div>}
        <button type="submit" disabled={busy} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: busy ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          <Send size={16} /> {busy ? "Envoi…" : "Envoyer la convocation"}
        </button>
      </form>
    </div>
  );
}
