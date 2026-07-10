"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useActiveYear } from "@/context/ActiveYearContext";
import { getTitulaires, getFrequenteBySalle, createRapport } from "@/lib/api";
import { ClipboardCheck, Check, X, Clock, ShieldAlert, Plus } from "lucide-react";

const inputStyle = { padding: "9px 12px", borderRadius: 9, border: "1.5px solid var(--surface-border)", fontSize: 13.5, fontFamily: "inherit", background: "#faf9f7", outline: "none" };
const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 600, color: "#4a3728", marginBottom: 4 };

// Faute de table dédiée, l'appel est consigné dans les "rapports" (dérivés).
const ETATS = [
  { key: "present", label: "Présent", icon: <Check size={14} />, color: "#16a34a" },
  { key: "absent", label: "Absent", icon: <X size={14} />, color: "#dc2626" },
  { key: "retard", label: "Retard", icon: <Clock size={14} />, color: "#d97706" },
];

export default function AppelPage() {
  const { user } = useAuth();
  const { anneeId } = useActiveYear();
  const idAca = anneeId; // année active globale (sélecteur du TopNav)
  const [titulaire, setTitulaire] = useState(null);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [etats, setEtats] = useState({});      // { matricule: 'present'|'absent'|'retard' }
  const [envoi, setEnvoi] = useState(false);
  const [info, setInfo] = useState("");

  // Discipline rapide
  const [discMat, setDiscMat] = useState("");
  const [discTxt, setDiscTxt] = useState("");
  const [discBusy, setDiscBusy] = useState(false);
  const [discInfo, setDiscInfo] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const tits = await getTitulaires();
        const mien = (Array.isArray(tits) ? tits : []).find((t) => Number(t.personne?.idPers) === Number(user?.id));
        if (!actif) return;
        setTitulaire(mien || null);
        if (mien?.salle?.idSalle) {
          const fr = await getFrequenteBySalle(mien.salle.idSalle);
          // Appel sur le roster de l'ANNÉE ACTIVE uniquement (via Frequente)
          const liste = (Array.isArray(fr) ? fr : [])
            .filter((f) => !anneeId || Number(f.anneeAcademique?.idAnnee) === Number(anneeId))
            .map((f) => f.eleve)
            .filter(Boolean);
          if (!actif) return;
          setEleves(liste);
          const init = {};
          liste.forEach((e) => (init[e.matricule] = "present"));
          setEtats(init);
        }
      } catch { if (actif) setTitulaire(null); }
      finally { if (actif) setLoading(false); }
    })();
    return () => { actif = false; };
  }, [user?.id, anneeId]);

  const enregistrerAppel = async () => {
    setInfo("");
    if (!idAca) { setInfo("Aucune année académique en base."); return; }
    const aConsigner = eleves.filter((e) => etats[e.matricule] === "absent" || etats[e.matricule] === "retard");
    if (aConsigner.length === 0) { setInfo("Aucune absence ni retard à consigner (tous présents)."); return; }
    setEnvoi(true);
    try {
      for (const e of aConsigner) {
        await createRapport({
          libelle: etats[e.matricule] === "absent" ? "Absence" : "Retard",
          points: 0,
          commentaire: `Appel du ${new Date(date).toLocaleDateString("fr-FR")}`,
          event_date: date,
          matricule: Number(e.matricule),
          idAca: Number(idAca),
          idPers: user?.id ? Number(user.id) : undefined,
        });
      }
      setInfo(`Appel enregistré : ${aConsigner.length} absence(s)/retard(s) consigné(s) pour le ${new Date(date).toLocaleDateString("fr-FR")}.`);
    } catch (e) { setInfo(e.message || "Échec de l'enregistrement de l'appel."); }
    finally { setEnvoi(false); }
  };

  const consignerDiscipline = async (ev) => {
    ev.preventDefault();
    setDiscInfo("");
    if (!discMat) { setDiscInfo("Choisis un élève."); return; }
    if (!discTxt.trim()) { setDiscInfo("Décris le fait."); return; }
    if (!idAca) { setDiscInfo("Aucune année académique en base."); return; }
    setDiscBusy(true);
    try {
      await createRapport({
        libelle: "Discipline",
        points: 0,
        commentaire: discTxt.trim(),
        event_date: date,
        matricule: Number(discMat),
        idAca: Number(idAca),
        idPers: user?.id ? Number(user.id) : undefined,
      });
      setDiscTxt(""); setDiscMat("");
      setDiscInfo("Fait de discipline consigné.");
    } catch (e) { setDiscInfo(e.message || "Échec."); }
    finally { setDiscBusy(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;
  if (!titulaire) return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 16 }}>Appel</h1>
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--surface-border)" }}>Vous n'êtes titulaire d'aucune classe.</div>
    </div>
  );

  const classe = titulaire.salle?.classe?.libelle || "—";
  const nbAbs = eleves.filter((e) => etats[e.matricule] === "absent").length;
  const nbRet = eleves.filter((e) => etats[e.matricule] === "retard").length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <ClipboardCheck size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Appel</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 20 }}>Classe <b>{classe}</b> · {eleves.length} élève(s)</p>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 18 }}>
        <div><label style={labelStyle}>Date de l'appel</label><input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{nbAbs} absent(s) · {nbRet} retard(s)</div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" }}>Élève</th>
            <th style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "right", borderBottom: "1px solid var(--surface-border)" }}>Présence</th>
          </tr></thead>
          <tbody>
            {eleves.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>Aucun élève.</td></tr>
            ) : eleves.map((e) => (
              <tr key={e.matricule}>
                <td style={{ padding: "10px 20px", fontSize: 14, borderBottom: "1px solid var(--surface-border)" }}>
                  <b>{e.prenom} {e.nom}</b> <span style={{ color: "var(--muted)" }}>#{e.matricule}</span>
                </td>
                <td style={{ padding: "10px 20px", textAlign: "right", borderBottom: "1px solid var(--surface-border)" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {ETATS.map((et) => {
                      const actif = etats[e.matricule] === et.key;
                      return (
                        <button key={et.key} onClick={() => setEtats((p) => ({ ...p, [e.matricule]: et.key }))}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, border: `1px solid ${actif ? et.color : "var(--surface-border)"}`, background: actif ? et.color : "var(--surface)", color: actif ? "white" : "var(--muted)" }}>
                          {et.icon}{et.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
        <button onClick={enregistrerAppel} disabled={envoi} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          <Check size={16} /> {envoi ? "Enregistrement…" : "Enregistrer l'appel"}
        </button>
        {info && <span style={{ fontSize: 13, color: "var(--muted)" }}>{info}</span>}
      </div>

      {/* Discipline rapide */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <ShieldAlert size={20} style={{ color: "var(--orange)" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-dark)" }}>Consigner un fait de discipline</h2>
      </div>
      <form onSubmit={consignerDiscipline} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 16, padding: 18 }}>
        <div style={{ minWidth: 220 }}>
          <label style={labelStyle}>Élève</label>
          <select style={{ ...inputStyle, width: "100%" }} value={discMat} onChange={(e) => setDiscMat(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {eleves.map((e) => <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <label style={labelStyle}>Fait</label>
          <input style={{ ...inputStyle, width: "100%" }} value={discTxt} onChange={(e) => setDiscTxt(e.target.value)} placeholder="Ex. Bavardage répété, matériel oublié…" maxLength={255} />
        </div>
        <button type="submit" disabled={discBusy} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13.5, fontWeight: 600, cursor: discBusy ? "default" : "pointer", fontFamily: "inherit" }}>
          <Plus size={15} /> {discBusy ? "…" : "Consigner"}
        </button>
        {discInfo && <span style={{ fontSize: 13, color: "var(--muted)", width: "100%" }}>{discInfo}</span>}
      </form>
    </div>
  );
}
