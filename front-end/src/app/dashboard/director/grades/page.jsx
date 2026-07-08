"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getEleves, getCours, getPersonnesTous, getNotesEleve, saisirNote,
  getAnnees, getTrimestres, getSessions, getNatures, getEpreuves,
  createAnnee, createTrimestre, createSession, createNature, createEpreuve,
  updateAnnee, deleteAnnee, updateTrimestre, deleteTrimestre, updateSession, deleteSession,
  updateNature, deleteNature, updateEpreuve, deleteEpreuve
} from "@/lib/api";
import { ClipboardCheck, Plus, X, Zap, Edit2, Trash2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 5 };
const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };

function Field({ label, children }) {
  return <div><label style={labelStyle}>{label}</label>{children}</div>;
}

// Libellé de l'année scolaire courante (démarre en septembre)
function anneeScolaireCourante() {
  const d = new Date();
  const y = d.getFullYear();
  return d.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

const fmtMoy = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");

export default function GradesPage() {
  const { user } = useAuth();
  const idAdmin = user?.role === "admin" && user?.id ? Number(user.id) : undefined;
  // « Saisi par » = le compte courant. Si c'est une personne (enseignant…),
  // on connaît son idPers ; si c'est un admin, le backend choisit un repli.
  const idPersCourant = user?.role === "personne" && user?.id ? Number(user.id) : undefined;

  const [tab, setTab] = useState("saisie"); // 'saisie' | 'referentiels'
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Référentiels
  const [eleves, setEleves] = useState([]);
  const [cours, setCours] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [trimestres, setTrimestres] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [natures, setNatures] = useState([]);
  const [epreuves, setEpreuves] = useState([]);

  // Saisie de notes
  const [matricule, setMatricule] = useState("");
  const [notes, setNotes] = useState([]);
  const [noteModal, setNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ idCours: "", idSession: "", idEpreuve: "", note: "", appreciation: "" });

  // Formulaires référentiels
  const [fAnnee, setFAnnee] = useState({ libelle: "", periode: "" });
  const [fTrim, setFTrim] = useState({ libelle: "", periode: "", idAca: "" });
  const [fSess, setFSess] = useState({ libelle: "", idTrimestre: "", idPers: "" });
  const [fNat, setFNat] = useState({ libelle: "" });
  const [fEpr, setFEpr] = useState({ libelle: "", idNature: "", idPers: "", urlDoc: "" });

  const [editModal, setEditModal] = useState({ type: null, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, impact: [], message: "" });

  const handleDelete = (type, id) => {
    setDeleteModal({ isOpen: true, type, id, impact: [], message: "Voulez-vous vraiment supprimer cet élément ?" });
  };

  const executeDelete = async (type, id, force = false) => {
    try {
      if (type === 'annee') await deleteAnnee(id, force);
      else if (type === 'trim') await deleteTrimestre(id, force);
      else if (type === 'sess') await deleteSession(id, force);
      else if (type === 'nat') await deleteNature(id, force);
      else if (type === 'epr') await deleteEpreuve(id, force);
      
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, type: null, id: null, impact: [], message: "" });
      await chargerTout();
    } catch (e) {
      if (e.requireConfirmation) {
         setDeleteModal({ isOpen: true, type, id, impact: e.impact, message: e.message });
      } else {
         alert(e.message || "Erreur lors de la suppression.");
      }
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editModal.data) return;
    setEnvoi(true); setError("");
    try {
      const { type, data } = editModal;
      if (type === 'annee') await updateAnnee(data.idAnnee, { libelle: data.libelle, periode: data.periode });
      else if (type === 'trim') await updateTrimestre(data.idTrimes, { libelle: data.libelle, periode: data.periode, idAca: Number(data.idAca) });
      else if (type === 'sess') await updateSession(data.idSession, { libelle: data.libelle, idTrimestre: Number(data.idTrimestre), idPers: Number(data.idPers) });
      else if (type === 'nat') await updateNature(data.idNature, { libelle: data.libelle });
      else if (type === 'epr') await updateEpreuve(data.idEpreuve, { libelle: data.libelle, idNature: Number(data.idNature), idPers: Number(data.idPers), urlDoc: data.urlDoc });
      setEditModal({ type: null, data: null });
      await chargerTout();
    } catch (err) { setError(err.message || "Erreur de modification."); }
    finally { setEnvoi(false); }
  };

  const chargerTout = useCallback(async () => {
    setError("");
    try {
      const [el, co, pe, an, tr, se, na, ep] = await Promise.all([
        getEleves(), getCours(), getPersonnesTous(), getAnnees(),
        getTrimestres(), getSessions(), getNatures(), getEpreuves(),
      ]);
      setEleves(el || []); setCours(co || []); setPersonnes(pe || []);
      setAnnees(an || []); setTrimestres(tr || []); setSessions(se || []);
      setNatures(na || []); setEpreuves(ep || []);
    } catch (e) { setError(e.message || "Erreur de chargement."); }
  }, []);

  useEffect(() => { chargerTout(); }, [chargerTout]);

  const chargerNotes = async (mat) => {
    if (!mat) { setNotes([]); return; }
    try { const n = await getNotesEleve(mat); setNotes(n || []); } catch { setNotes([]); }
  };

  const onSelectEleve = (mat) => { setMatricule(mat); chargerNotes(mat); };

  // ── Soumissions référentiels ──
  const submit = async (fn, reset, after) => {
    setEnvoi(true); setError("");
    try { await fn(); reset(); await chargerTout(); if (after) after(); }
    catch (e) { setError(e.message || "Échec de l'enregistrement."); }
    finally { setEnvoi(false); }
  };

  const addAnnee = (e) => { e.preventDefault(); if (!fAnnee.libelle.trim()) return;
    submit(() => createAnnee({ libelle: fAnnee.libelle.trim(), periode: fAnnee.periode.trim() || "INDEFINI", idAdmin }), () => setFAnnee({ libelle: "", periode: "" })); };
  const addTrim = (e) => { e.preventDefault(); if (!fTrim.libelle.trim() || !fTrim.idAca) { setError("Libellé et année requis."); return; }
    submit(() => createTrimestre({ libelle: fTrim.libelle.trim(), periode: fTrim.periode.trim() || "INDEFINI", idAca: Number(fTrim.idAca), idAdmin }), () => setFTrim({ libelle: "", periode: "", idAca: "" })); };
  const addSess = (e) => { e.preventDefault(); if (!fSess.libelle.trim() || !fSess.idTrimestre || !fSess.idPers) { setError("Libellé, trimestre et responsable requis."); return; }
    submit(() => createSession({ libelle: fSess.libelle.trim(), idTrimestre: Number(fSess.idTrimestre), idPers: Number(fSess.idPers) }), () => setFSess({ libelle: "", idTrimestre: "", idPers: "" })); };
  const addNat = (e) => { e.preventDefault(); if (!fNat.libelle.trim()) return;
    submit(() => createNature({ libelle: fNat.libelle.trim() }), () => setFNat({ libelle: "" })); };
  const addEpr = (e) => { e.preventDefault(); if (!fEpr.libelle.trim() || !fEpr.idNature || !fEpr.idPers) { setError("Libellé, nature et auteur requis."); return; }
    submit(() => createEpreuve({ libelle: fEpr.libelle.trim(), idNature: Number(fEpr.idNature), idPers: Number(fEpr.idPers), urlDoc: fEpr.urlDoc || undefined }), () => setFEpr({ libelle: "", idNature: "", idPers: "", urlDoc: "" })); };

  // ── Saisie d'une note ──
  const soumettreNote = async (e) => {
    e.preventDefault();
    setError("");
    const { idCours, idSession, idEpreuve, note } = noteForm;
    if (!idCours || !idSession || !idEpreuve || note === "") { setError("Cours, session, épreuve et note sont requis."); return; }
    setEnvoi(true);
    try {
      await saisirNote({
        note: Number(note),
        appreciation: noteForm.appreciation.trim() || "RAS",
        matricule: Number(matricule),
        idCours: Number(idCours),
        idSession: Number(idSession),
        idEpreuve: Number(idEpreuve),
        // « saisi par » = compte courant (ou repli backend si l'auteur est un admin)
        idPers: idPersCourant,
      });
      setNoteModal(false);
      setNoteForm({ idCours: "", idSession: "", idEpreuve: "", note: "", appreciation: "" });
      await chargerNotes(matricule);
    } catch (err) { setError(err.message || "Échec de la saisie."); }
    finally { setEnvoi(false); }
  };

  // ── Moyennes (pondérées par le coefficient du cours) ──
  const moyennes = useMemo(() => {
    const groupes = {};
    for (const n of notes) {
      const key = n.session?.idSession ?? "_";
      if (!groupes[key]) groupes[key] = { libelle: n.session?.libelle || "Session", pts: 0, coef: 0, nb: 0 };
      const coef = Number(n.cours?.coefficient) || 1;
      groupes[key].pts += (Number(n.note) || 0) * coef;
      groupes[key].coef += coef;
      groupes[key].nb += 1;
    }
    const sessions = Object.values(groupes).map((g) => ({ ...g, moy: g.coef ? g.pts / g.coef : 0 }));
    const totPts = sessions.reduce((a, s) => a + s.pts, 0);
    const totCoef = sessions.reduce((a, s) => a + s.coef, 0);
    return { sessions, generale: totCoef ? totPts / totCoef : 0, totCoef };
  }, [notes]);

  // ── Démarrage rapide : crée en une fois un jeu de référentiels minimal ──
  // (réutilise l'existant ; ne crée que les maillons manquants de la chaîne)
  const refsIncomplets = sessions.length === 0 || epreuves.length === 0;
  const demarrageRapide = async () => {
    setSeeding(true); setError("");
    try {
      const respId = idPersCourant || personnes[0]?.idPers;
      if (!respId) throw new Error("Crée d'abord au moins un membre du personnel (il sera responsable de la session).");
      const annee = annees[0] || await createAnnee({ libelle: anneeScolaireCourante(), periode: "INDEFINI", idAdmin });
      const trim = trimestres[0] || await createTrimestre({ libelle: "1er Trimestre", periode: "INDEFINI", idAca: Number(annee.idAnnee), idAdmin });
      if (sessions.length === 0) await createSession({ libelle: "Session 1", idTrimestre: Number(trim.idTrimes), idPers: Number(respId) });
      const nature = natures[0] || await createNature({ libelle: "Composition" });
      if (epreuves.length === 0) await createEpreuve({ libelle: "Composition", idNature: Number(nature.idNature), idPers: Number(respId) });
      await chargerTout();
    } catch (e) { setError(e.message || "Échec du démarrage rapide."); }
    finally { setSeeding(false); }
  };

  // Nom affiché du « saisi par »
  const moiPersonne = personnes.find((p) => Number(p.idPers) === idPersCourant);
  const saisiParLabel = idPersCourant
    ? (moiPersonne ? `${moiPersonne.prenom} ${moiPersonne.nom}` : (user?.nom || "Vous"))
    : `${user?.nom || "Administrateur"} (compte administrateur)`;

  const tabs = [{ key: "saisie", label: "Saisie de notes" }, { key: "referentiels", label: "Référentiels" }];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <ClipboardCheck size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Évaluations</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return <button key={tb.key} onClick={() => setTab(tb.key)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)", boxShadow: active ? "0 4px 12px rgba(216,99,16,0.25)" : "none" }}>{tb.label}</button>;
        })}
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {/* 🔴🔴🔴 Modal d'édition des référentiels 🔴🔴🔴 */}
      {editModal.data && (
        <div onClick={() => !envoi && setEditModal({ type: null, data: null })} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 450, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Modifier</h2>
              <button onClick={() => !envoi && setEditModal({ type: null, data: null })} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={20} /></button>
            </div>
            <form onSubmit={submitEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Libellé *">
                <input style={inputStyle} value={editModal.data.libelle || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, libelle: e.target.value } }))} required />
              </Field>
              
              {(editModal.type === 'annee' || editModal.type === 'trim') && (
                <Field label="Période">
                  <input style={inputStyle} value={editModal.data.periode || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, periode: e.target.value } }))} />
                </Field>
              )}

              {editModal.type === 'trim' && (
                <Field label="Année *">
                  <select style={inputStyle} value={editModal.data.idAca || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, idAca: e.target.value } }))} required>
                    <option value="">— Choisir —</option>
                    {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                  </select>
                </Field>
              )}

              {editModal.type === 'sess' && (
                <>
                  <Field label="Trimestre *">
                    <select style={inputStyle} value={editModal.data.idTrimestre || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, idTrimestre: e.target.value } }))} required>
                      <option value="">— Choisir —</option>
                      {trimestres.map((t) => <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>)}
                    </select>
                  </Field>
                  <Field label="Responsable *">
                    <select style={inputStyle} value={editModal.data.idPers || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, idPers: e.target.value } }))} required>
                      <option value="">— Choisir —</option>
                      {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                    </select>
                  </Field>
                </>
              )}

              {editModal.type === 'epr' && (
                <>
                  <Field label="Nature *">
                    <select style={inputStyle} value={editModal.data.idNature || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, idNature: e.target.value } }))} required>
                      <option value="">— Choisir —</option>
                      {natures.map((n) => <option key={n.idNature} value={n.idNature}>{n.libelle}</option>)}
                    </select>
                  </Field>
                  <Field label="Auteur *">
                    <select style={inputStyle} value={editModal.data.idPers || ""} onChange={(e) => setEditModal((s) => ({ ...s, data: { ...s.data, idPers: e.target.value } }))} required>
                      <option value="">— Choisir —</option>
                      {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                    </select>
                  </Field>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setEditModal({ type: null, data: null })} disabled={envoi} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SAISIE ── */}
      {tab === "saisie" && (
        <>
          {refsIncomplets && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "14px 18px", marginBottom: 18, borderRadius: 14, background: "rgba(216,99,16,0.07)", border: "1px solid rgba(216,99,16,0.2)" }}>
              <div style={{ fontSize: 13.5, color: "#ac3b02" }}>
                <b>Référentiels incomplets.</b> Avant de saisir une note il faut une <b>session</b> et une <b>épreuve</b>. Crée la chaîne (année → trimestre → session, nature → épreuve) en un clic.
              </div>
              <button onClick={demarrageRapide} disabled={seeding}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, border: "none", cursor: seeding ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", background: seeding ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white" }}>
                <Zap size={16} /> {seeding ? "Création…" : "Démarrage rapide"}
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ minWidth: 320 }}>
              <Field label="Élève">
                <select style={inputStyle} value={matricule} onChange={(e) => onSelectEleve(e.target.value)}>
                  <option value="">— Sélectionner un élève —</option>
                  {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
                </select>
              </Field>
            </div>
            {matricule && (
              <button onClick={() => { setNoteForm({ idCours: "", idSession: "", idEpreuve: "", note: "", appreciation: "" }); setError(""); setNoteModal(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white" }}>
                <Plus size={16} /> Nouvelle note
              </button>
            )}
          </div>

          {/* Moyennes en sortie (pondérées par coefficient) */}
          {matricule && notes.length > 0 && (
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ borderRadius: 16, padding: "16px 22px", minWidth: 180, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white" }}>
                <div style={{ fontSize: 13, opacity: 0.85 }}>Moyenne générale</div>
                <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-display)" }}>{fmtMoy(moyennes.generale)}<span style={{ fontSize: 15, opacity: 0.85 }}>/20</span></div>
              </div>
              {moyennes.sessions.map((s, i) => (
                <div key={i} style={{ borderRadius: 16, padding: "16px 22px", minWidth: 150, background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
                  <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{s.libelle} <span style={{ opacity: 0.7 }}>({s.nb})</span></div>
                  <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-dark)" }}>{fmtMoy(s.moy)}<span style={{ fontSize: 13, color: "var(--muted)" }}>/20</span></div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            {!matricule ? <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Sélectionnez un élève pour voir et saisir ses notes.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={thStyle}>Cours</th><th style={thStyle}>Coef.</th><th style={thStyle}>Session</th><th style={thStyle}>Épreuve</th><th style={thStyle}>Note</th><th style={thStyle}>Appréciation</th></tr></thead>
                <tbody>
                  {notes.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={6}>Aucune note pour cet élève.</td></tr> :
                    notes.map((n) => (
                      <tr key={n.idEval}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{n.cours?.libelle || "—"}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{n.cours?.coefficient ?? 1}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{n.session?.libelle || "—"}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{n.epreuve?.libelle || "—"}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{n.note}/20</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{n.appreciation && n.appreciation !== "RAS" ? n.appreciation : "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── RÉFÉRENTIELS ── */}
      {tab === "referentiels" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Année */}
          <RefCard title="Année académique" items={annees} getLabel={a => a.libelle} onEdit={a => setEditModal({ type: 'annee', data: a })} onDelete={a => handleDelete('annee', a.idAnnee)}>
            <form onSubmit={addAnnee} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Libellé *"><input style={inputStyle} value={fAnnee.libelle} onChange={(e) => setFAnnee((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : 2025-2026" /></Field>
              <Field label="Période"><input style={inputStyle} value={fAnnee.periode} onChange={(e) => setFAnnee((s) => ({ ...s, periode: e.target.value }))} /></Field>
              <Btn envoi={envoi} />
            </form>
          </RefCard>

          {/* Trimestre */}
          <RefCard title="Trimestre" items={trimestres} getLabel={t => t.libelle} onEdit={t => setEditModal({ type: 'trim', data: t })} onDelete={t => handleDelete('trim', t.idTrimes)}>
            <form onSubmit={addTrim} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Libellé *"><input style={inputStyle} value={fTrim.libelle} onChange={(e) => setFTrim((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : 1er Trimestre" /></Field>
              <Field label="Année *">
                <select style={inputStyle} value={fTrim.idAca} onChange={(e) => setFTrim((s) => ({ ...s, idAca: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                </select>
              </Field>
              <Btn envoi={envoi} disabled={annees.length === 0} hint={annees.length === 0 ? "Crée d'abord une année." : ""} />
            </form>
          </RefCard>

          {/* Session */}
          <RefCard title="Session" items={sessions} getLabel={s => s.libelle} onEdit={s => setEditModal({ type: 'sess', data: s })} onDelete={s => handleDelete('sess', s.idSession)}>
            <form onSubmit={addSess} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Libellé *"><input style={inputStyle} value={fSess.libelle} onChange={(e) => setFSess((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Session 1" /></Field>
              <Field label="Trimestre *">
                <select style={inputStyle} value={fSess.idTrimestre} onChange={(e) => setFSess((s) => ({ ...s, idTrimestre: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {trimestres.map((t) => <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>)}
                </select>
              </Field>
              <Field label="Responsable *">
                <select style={inputStyle} value={fSess.idPers} onChange={(e) => setFSess((s) => ({ ...s, idPers: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                </select>
              </Field>
              <Btn envoi={envoi} disabled={trimestres.length === 0 || personnes.length === 0} hint={trimestres.length === 0 ? "Crée d'abord un trimestre." : ""} />
            </form>
          </RefCard>

          {/* Nature */}
          <RefCard title="Nature d'épreuve" items={natures} getLabel={n => n.libelle} onEdit={n => setEditModal({ type: 'nat', data: n })} onDelete={n => handleDelete('nat', n.idNature)}>
            <form onSubmit={addNat} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Libellé *"><input style={inputStyle} value={fNat.libelle} onChange={(e) => setFNat({ libelle: e.target.value })} placeholder="ex : Composition" /></Field>
              <Btn envoi={envoi} />
            </form>
          </RefCard>

          {/* Épreuve */}
          <RefCard title="Épreuve" items={epreuves} getLabel={e => e.libelle} onEdit={e => setEditModal({ type: 'epr', data: e })} onDelete={e => handleDelete('epr', e.idEpreuve)}>
            <form onSubmit={addEpr} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Libellé *"><input style={inputStyle} value={fEpr.libelle} onChange={(e) => setFEpr((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Compo Maths T1" /></Field>
              <Field label="Nature *">
                <select style={inputStyle} value={fEpr.idNature} onChange={(e) => setFEpr((s) => ({ ...s, idNature: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {natures.map((n) => <option key={n.idNature} value={n.idNature}>{n.libelle}</option>)}
                </select>
              </Field>
              <Field label="Auteur *">
                <select style={inputStyle} value={fEpr.idPers} onChange={(e) => setFEpr((s) => ({ ...s, idPers: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                </select>
              </Field>
              <Field label="Document (sujet)"><FileUpload value={fEpr.urlDoc} onUploaded={(url) => setFEpr((s) => ({ ...s, urlDoc: url }))} accept=".pdf,.doc,.docx,image/*" label="Joindre le sujet" /></Field>
              <Btn envoi={envoi} disabled={natures.length === 0 || personnes.length === 0} hint={natures.length === 0 ? "Crée d'abord une nature." : ""} />
            </form>
          </RefCard>
        </div>
      )}

      {/* ── Modal saisie note ── */}
      {noteModal && (
        <div onClick={() => !envoi && setNoteModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Nouvelle note</h2>
              <button onClick={() => !envoi && setNoteModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={20} /></button>
            </div>
            <form onSubmit={soumettreNote} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Cours *">
                <select style={inputStyle} value={noteForm.idCours} onChange={(e) => setNoteForm((s) => ({ ...s, idCours: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {cours.map((c) => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                </select>
              </Field>
              <Field label="Session *">
                <select style={inputStyle} value={noteForm.idSession} onChange={(e) => setNoteForm((s) => ({ ...s, idSession: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {sessions.map((s) => <option key={s.idSession} value={s.idSession}>{s.libelle}</option>)}
                </select>
              </Field>
              <Field label="Épreuve *">
                <select style={inputStyle} value={noteForm.idEpreuve} onChange={(e) => setNoteForm((s) => ({ ...s, idEpreuve: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {epreuves.map((ep) => <option key={ep.idEpreuve} value={ep.idEpreuve}>{ep.libelle}</option>)}
                </select>
              </Field>
              <Field label="Saisi par">
                <div style={{ ...inputStyle, display: "flex", alignItems: "center", background: "rgba(216,99,16,0.06)", color: "var(--text-dark)", fontWeight: 600 }}>
                  {saisiParLabel}
                </div>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
                <Field label="Note /20 *"><input type="number" min="0" max="20" step="0.25" style={inputStyle} value={noteForm.note} onChange={(e) => setNoteForm((s) => ({ ...s, note: e.target.value }))} /></Field>
                <Field label="Appréciation"><input style={inputStyle} value={noteForm.appreciation} onChange={(e) => setNoteForm((s) => ({ ...s, appreciation: e.target.value }))} placeholder="Optionnel" /></Field>
              </div>
              {(cours.length === 0 || sessions.length === 0 || epreuves.length === 0) && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(216,99,16,0.08)", border: "1px solid rgba(216,99,16,0.2)", color: "#ac3b02", fontSize: 13 }}>
                  Il faut un <b>cours</b>, une <b>session</b> et une <b>épreuve</b> en base (onglet Référentiels).
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setNoteModal(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Confirmation de suppression"
        message={deleteModal.message}
        impact={deleteModal.impact}
        onClose={() => setDeleteModal({ isOpen: false, type: null, id: null, impact: [], message: "" })}
        onConfirm={() => executeDelete(deleteModal.type, deleteModal.id, deleteModal.impact && deleteModal.impact.length > 0)}
      />
    </div>
  );
}

function RefCard({ title, items, getLabel, onEdit, onDelete, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>{title} <span style={{ color: "var(--muted)", fontWeight: 500 }}>({items.length})</span></h3>
      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: "rgba(216,99,16,0.08)", color: "var(--orange)" }}>
              <span style={{ fontSize: 12 }}>{getLabel ? getLabel(it) : it}</span>
              {onEdit && <button type="button" onClick={() => onEdit(it)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", padding: 0, marginLeft: 4, display: "flex", alignItems: "center" }} title="Modifier"><Edit2 size={12} /></button>}
              {onDelete && <button type="button" onClick={() => onDelete(it)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0, marginLeft: 4, display: "flex", alignItems: "center" }} title="Supprimer"><Trash2 size={12} /></button>}
            </div>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function Btn({ envoi, disabled, hint }) {
  return (
    <div>
      <button type="submit" disabled={envoi || disabled} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: (envoi || disabled) ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: (envoi || disabled) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
        {envoi ? "…" : "Ajouter"}
      </button>
      {hint && <p style={{ fontSize: 11, color: "#8a7060", marginTop: 6 }}>{hint}</p>}
    </div>
  );
}
