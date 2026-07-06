"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTitulaires, getAnnees, getFrequenteBySalle, convoquerParentsClasse } from "@/lib/api";
import { Users2, CalendarDays, MapPin, Send } from "lucide-react";

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

export default function ReunionPage() {
  const { user } = useAuth();
  const [titulaire, setTitulaire] = useState(null);
  const [annee, setAnnee] = useState(null);
  const [nbEleves, setNbEleves] = useState(0);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    heure: "09:00",
    lieu: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [tits, annees] = await Promise.all([getTitulaires(), getAnnees().catch(() => [])]);
        const mien = (Array.isArray(tits) ? tits : []).find((t) => Number(t.personne?.idPers) === Number(user?.id));
        if (!actif) return;
        setTitulaire(mien || null);
        setAnnee((Array.isArray(annees) ? annees : []).reduce((a, c) => (!a || Number(c.idAnnee) > Number(a.idAnnee) ? c : a), null));
        if (mien?.salle?.idSalle) {
          const fr = await getFrequenteBySalle(mien.salle.idSalle).catch(() => []);
          if (actif) setNbEleves((Array.isArray(fr) ? fr : []).length);
        }
      } catch { if (actif) setTitulaire(null); }
      finally { if (actif) setLoading(false); }
    })();
    return () => { actif = false; };
  }, [user?.id]);

  const envoyer = async (ev) => {
    ev.preventDefault();
    setInfo(""); setError("");
    if (!titulaire?.salle?.idSalle) { setError("Vous n'êtes titulaire d'aucune classe."); return; }
    if (!form.lieu.trim()) { setError("Indiquez le lieu de la réunion."); return; }
    setBusy(true);
    try {
      const dateFr = new Date(form.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const classe = titulaire.salle?.classe?.libelle || "";
      const information =
        `Chers parents,\nVous êtes convié(e)s à une réunion parents-titulaire de la classe ${classe}, ` +
        `le ${dateFr} à ${form.heure}, au lieu suivant : ${form.lieu.trim()}.` +
        (form.message.trim() ? `\n\n${form.message.trim()}` : "") +
        `\n\nVotre présence est vivement souhaitée.`;
      const res = await convoquerParentsClasse(titulaire.salle.idSalle, {
        objet: `Convocation — Réunion parents-titulaire (${classe})`,
        information,
        AnneeAcade: annee?.libelle || "",
      });
      setInfo(`Convocation envoyée à ${res?.envoyes ?? 0} parent(s).`);
      setForm((f) => ({ ...f, lieu: "", message: "" }));
    } catch (e) { setError(e.message || "Échec de l'envoi de la convocation."); }
    finally { setBusy(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;
  if (!titulaire) return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 16 }}>Réunion parents</h1>
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--surface-border)" }}>Vous n'êtes titulaire d'aucune classe.</div>
    </div>
  );

  const classe = titulaire.salle?.classe?.libelle || "—";

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <Users2 size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Réunion parents-titulaire</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>Classe <b>{classe}</b> · convoque en une fois les parents des <b>{nbEleves}</b> élève(s) (message + email).</p>

      <form onSubmit={envoyer} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}><CalendarDays size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />Date</label>
            <input type="date" style={inputStyle} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div style={{ width: 130 }}>
            <label style={labelStyle}>Heure</label>
            <input type="time" style={inputStyle} value={form.heure} onChange={(e) => setForm((f) => ({ ...f, heure: e.target.value }))} />
          </div>
        </div>
        <div>
          <label style={labelStyle}><MapPin size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />Lieu *</label>
          <input style={inputStyle} value={form.lieu} onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))} placeholder="Ex. Salle de classe, réfectoire…" maxLength={200} />
        </div>
        <div>
          <label style={labelStyle}>Message complémentaire (optionnel)</label>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Ordre du jour, consignes…" maxLength={1000} />
        </div>
        {error && <div style={{ fontSize: 13, color: "#dc2626" }}>{error}</div>}
        {info && <div style={{ fontSize: 13, color: "#16a34a" }}>{info}</div>}
        <button type="submit" disabled={busy} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 12, border: "none", background: busy ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          <Send size={16} /> {busy ? "Envoi…" : "Convoquer les parents"}
        </button>
      </form>
    </div>
  );
}
