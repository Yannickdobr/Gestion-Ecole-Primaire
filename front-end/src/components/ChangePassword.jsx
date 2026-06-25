"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";
import { KeyRound } from "lucide-react";

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

export default function ChangePassword() {
  const [form, setForm] = useState({ ancien: "", nouveau: "", confirme: "" });
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [envoi, setEnvoi] = useState(false);

  const maj = (champ, val) => setForm((f) => ({ ...f, [champ]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.ancien || !form.nouveau) { setMsg({ type: "err", text: "Tous les champs sont requis." }); return; }
    if (form.nouveau.length < 4) { setMsg({ type: "err", text: "Le nouveau mot de passe doit contenir au moins 4 caractères." }); return; }
    if (form.nouveau !== form.confirme) { setMsg({ type: "err", text: "La confirmation ne correspond pas." }); return; }
    setEnvoi(true);
    try {
      await changePassword({ ancienMotDePasse: form.ancien, nouveauMotDePasse: form.nouveau });
      setMsg({ type: "ok", text: "Mot de passe modifié avec succès." });
      setForm({ ancien: "", nouveau: "", confirme: "" });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Échec de la modification." });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 24, maxWidth: 460 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <KeyRound size={18} style={{ color: "var(--orange)" }} /> Changer mon mot de passe
      </h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label style={labelStyle}>Ancien mot de passe *</label><input type="password" style={inputStyle} value={form.ancien} onChange={(e) => maj("ancien", e.target.value)} /></div>
        <div><label style={labelStyle}>Nouveau mot de passe *</label><input type="password" style={inputStyle} value={form.nouveau} onChange={(e) => maj("nouveau", e.target.value)} /></div>
        <div><label style={labelStyle}>Confirmer le nouveau *</label><input type="password" style={inputStyle} value={form.confirme} onChange={(e) => maj("confirme", e.target.value)} /></div>

        {msg && (
          <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, background: msg.type === "ok" ? "rgba(22,163,74,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${msg.type === "ok" ? "rgba(22,163,74,0.25)" : "rgba(239,68,68,0.2)"}`, color: msg.type === "ok" ? "#16a34a" : "#dc2626" }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={envoi} style={{ padding: "11px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {envoi ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
    </div>
  );
}
