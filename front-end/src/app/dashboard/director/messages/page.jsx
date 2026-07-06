"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getMessages, getMesMessages, getMessagesEnvoyes, getMessagesBrouillons, getMessagesStats,
  envoyerMessage, envoyerMessageMasse, validerMessage, supprimerMessage, modifierMessage,
  getPersonnesTous, getEleves, getParentsEleve,
} from "@/lib/api";
import { MessageSquare, Plus, Check, Trash2, X, Send, Pencil } from "lucide-react";

const TYPES = { 0: "Individuel", 1: "Tous les parents", 2: "Paiement" };

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

function formatDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
}

const FORM_VIDE = { idExp_Pers: "", matricule: "", idParent: "", objet: "", information: "", type_message: "0", masse: false };

export default function MessagesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState("tous"); // 'tous' | 'envoyes' | 'brouillons'
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, envoyes: 0, brouillons: 0, archives: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Compose
  const [modalOuvert, setModalOuvert] = useState(false);
  const [personnes, setPersonnes] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [parentsEleve, setParentsEleve] = useState([]);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [editMsg, setEditMsg] = useState(null); // brouillon en cours d'édition (null = nouveau)

  const charger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        // Admin : supervision globale de toute la messagerie
        const loader = tab === "envoyes" ? getMessagesEnvoyes : tab === "brouillons" ? getMessagesBrouillons : getMessages;
        const [list, st] = await Promise.all([loader(), getMessagesStats()]);
        setMessages(Array.isArray(list) ? list : []);
        if (st) setStats(st);
      } else {
        // Personnel : uniquement SES propres messages (confidentialité)
        const mine = await getMesMessages();
        const all = Array.isArray(mine) ? mine : [];
        const filtre = tab === "envoyes" ? all.filter((m) => Number(m.valider) === 1)
          : tab === "brouillons" ? all.filter((m) => Number(m.valider) === 0)
          : all;
        setMessages(filtre);
        setStats({
          total: all.length,
          envoyes: all.filter((m) => Number(m.valider) === 1).length,
          brouillons: all.filter((m) => Number(m.valider) === 0).length,
          archives: all.filter((m) => Number(m.valider) === 2).length,
        });
      }
    } catch (e) {
      setError(e.message || "Erreur de chargement des messages.");
    } finally {
      setLoading(false);
    }
  }, [tab, isAdmin]);

  useEffect(() => { charger(); }, [charger]);

  // Charger les référentiels du formulaire (une fois)
  useEffect(() => {
    (async () => {
      try {
        const [p, e] = await Promise.all([getPersonnesTous(), getEleves()]);
        setPersonnes(Array.isArray(p) ? p : []);
        setEleves(Array.isArray(e) ? e : []);
      } catch { /* silencieux : géré à l'ouverture du modal */ }
    })();
  }, []);

  const maj = (champ, val) => setForm((f) => ({ ...f, [champ]: val }));

  // Quand on choisit un élève, charger ses parents
  const onSelectEleve = async (matricule) => {
    setForm((f) => ({ ...f, matricule, idParent: "" }));
    setParentsEleve([]);
    if (!matricule) return;
    try {
      const data = await getParentsEleve(matricule);
      setParentsEleve(Array.isArray(data) ? data : []);
    } catch { setParentsEleve([]); }
  };

  const valider = async (m) => {
    setBusyId(m.idMessages); setError("");
    try { await validerMessage(m.idMessages); await charger(); }
    catch (e) { setError(e.message || "Validation impossible."); }
    finally { setBusyId(null); }
  };

  const supprimer = async (m) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce message ?")) return;
    setBusyId(m.idMessages); setError("");
    try { await supprimerMessage(m.idMessages); await charger(); }
    catch (e) { setError(e.message || "Suppression impossible."); }
    finally { setBusyId(null); }
  };

  const ouvrirEdition = (m) => {
    setEditMsg(m);
    setForm({ ...FORM_VIDE, objet: m.objet || "", information: m.information || "", type_message: String(m.type_message ?? 0) });
    setParentsEleve([]);
    setFormErreur("");
    setModalOuvert(true);
  };

  const fermerModal = () => { setModalOuvert(false); setEditMsg(null); };

  const soumettre = async (ev) => {
    ev.preventDefault();
    setFormErreur("");
    if (!form.objet.trim() || form.information.trim().length < 5) {
      setFormErreur("Objet requis et message d'au moins 5 caractères."); return;
    }
    setEnvoi(true);
    try {
      // Édition d'un brouillon existant : on ne change que objet/message/type.
      if (editMsg) {
        await modifierMessage(editMsg.idMessages, {
          objet: form.objet.trim(),
          information: form.information.trim(),
          type_message: Number(form.type_message),
        });
        fermerModal();
        setForm(FORM_VIDE);
        await charger();
        setEnvoi(false);
        return;
      }
      if (form.masse) {
        // Envoi de masse : à tous les parents de l'élève sélectionné
        const idParents = parentsEleve.map((p) => p.idParent);
        if (idParents.length === 0) { setFormErreur("Cet élève n'a aucun parent rattaché."); setEnvoi(false); return; }
        await envoyerMessageMasse({
          objet: form.objet.trim(),
          information: form.information.trim(),
          type_message: Number(form.type_message),
          idParents,
        });
      } else {
        if (!form.idParent) { setFormErreur("Choisis un parent destinataire."); setEnvoi(false); return; }
        await envoyerMessage({
          objet: form.objet.trim(),
          information: form.information.trim(),
          type_message: Number(form.type_message),
          idParent: Number(form.idParent),
        });
      }
      setModalOuvert(false);
      setForm(FORM_VIDE);
      setParentsEleve([]);
      await charger();
    } catch (e) {
      setFormErreur(e.message || "Échec de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  };

  const tabs = [
    { key: "tous", label: "Tous" },
    { key: "envoyes", label: "Envoyés" },
    { key: "brouillons", label: "Brouillons" },
  ];
  const cartes = [
    { label: "Total", val: stats.total },
    { label: "Envoyés", val: stats.envoyes },
    { label: "Brouillons", val: stats.brouillons },
    { label: "Archivés", val: stats.archives },
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MessageSquare size={28} style={{ color: "var(--orange)" }} />
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Messagerie</h1>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "2px 0 0" }}>
              {isAdmin ? "Supervision : tous les messages de l'établissement." : "Vous ne voyez que les messages que vous avez envoyés."}
            </p>
          </div>
        </div>
        <button onClick={() => { setEditMsg(null); setForm(FORM_VIDE); setParentsEleve([]); setFormErreur(""); setModalOuvert(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", boxShadow: "0 4px 12px rgba(216,99,16,0.25)" }}>
          <Plus size={16} /> Nouveau message
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {cartes.map((c) => (
          <div key={c.label} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>{c.val ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{ padding: "9px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)", boxShadow: active ? "0 4px 12px rgba(216,99,16,0.25)" : "none" }}>
              {tb.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>
      )}

      {/* Liste */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Aucun message.</div>
        ) : (
          <div>
            {messages.map((m) => (
              <div key={m.idMessages} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--surface-border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>{m.objet}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>{TYPES[m.type_message] ?? "—"}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: Number(m.valider) === 1 ? "rgba(22,163,74,0.1)" : "rgba(138,112,96,0.12)", color: Number(m.valider) === 1 ? "#16a34a" : "#8a7060" }}>
                      {Number(m.valider) === 1 ? "Envoyé" : "Brouillon"}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.information}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    De <b>{m.expediteur?.prenom} {m.expediteur?.nom}</b> · à <b>{m.destinataire?.personne?.prenom} {m.destinataire?.personne?.nom}</b> · {formatDate(m.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {Number(m.valider) !== 1 && (
                    <>
                      <button onClick={() => ouvrirEdition(m)} disabled={busyId === m.idMessages} title="Modifier le brouillon" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Pencil size={14} /> Modifier
                      </button>
                      <button onClick={() => valider(m)} disabled={busyId === m.idMessages} title="Valider (envoyer)" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Check size={14} /> Valider
                      </button>
                    </>
                  )}
                  <button onClick={() => supprimer(m)} disabled={busyId === m.idMessages} title="Supprimer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal composition ── */}
      {modalOuvert && (
        <div onClick={() => !envoi && fermerModal()} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 20px", zIndex: 1000, overflowY: "auto" }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 560, margin: "auto", background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>{editMsg ? "Modifier le brouillon" : "Nouveau message"}</h2>
              <button onClick={() => !envoi && fermerModal()} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={22} /></button>
            </div>

            <form onSubmit={soumettre} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12.5, color: "#8a7060", margin: 0 }}>
                {editMsg
                  ? "✏️ Édition du brouillon : le destinataire ne change pas, seul le contenu est modifiable."
                  : "✉️ Le message sera envoyé en votre nom (compte connecté)."}
              </p>

              {!editMsg && (
                <>
                  <div>
                    <label style={labelStyle}>Élève concerné *</label>
                    <select style={inputStyle} value={form.matricule} onChange={(e) => onSelectEleve(e.target.value)}>
                      <option value="">— Choisir un élève —</option>
                      {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
                    </select>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4a3728", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.masse} onChange={(e) => maj("masse", e.target.checked)} />
                    Envoyer à <b>tous les parents</b> de cet élève (envoi de masse)
                  </label>

                  {!form.masse && (
                    <div>
                      <label style={labelStyle}>Parent destinataire *</label>
                      <select style={inputStyle} value={form.idParent} onChange={(e) => maj("idParent", e.target.value)} disabled={!form.matricule}>
                        <option value="">{form.matricule ? "— Choisir un parent —" : "Choisis d'abord un élève"}</option>
                        {parentsEleve.map((p) => <option key={p.idParent} value={p.idParent}>{p.personne?.prenom} {p.personne?.nom}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.type_message} onChange={(e) => maj("type_message", e.target.value)}>
                  <option value="0">Individuel</option>
                  <option value="1">Tous les parents</option>
                  <option value="2">Paiement</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Objet *</label>
                <input style={inputStyle} value={form.objet} onChange={(e) => maj("objet", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.information} onChange={(e) => maj("information", e.target.value)} />
              </div>

              {formErreur && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{formErreur}</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
                <button type="button" onClick={fermerModal} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {editMsg ? <><Check size={15} /> {envoi ? "Enregistrement…" : "Enregistrer"}</> : <><Send size={15} /> {envoi ? "Envoi…" : "Envoyer"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
