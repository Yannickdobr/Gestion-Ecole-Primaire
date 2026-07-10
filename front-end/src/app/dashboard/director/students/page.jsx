"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useActiveYear } from "@/context/ActiveYearContext";
import {
  getEleves, getElevesByAnnee, createEleve, desactiverEleve, activerEleve, getVilles, seedVilles,
  getParentsEleve, createPersonne, addParentToEleve,
  getSalles, getAnnees, affecterEleve, getFrequenteByEleve, reaffecterEleve, deleteEleve,
} from "@/lib/api";
import { exporterCSV } from "@/lib/export";
import FileUpload from "@/components/FileUpload";
import { User, Users, GraduationCap, Building2, Eye, MapPin, Edit, Search, Plus, Trash2, X, Download, Shield, UserPlus, Repeat, Power, PowerOff } from "lucide-react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

function Avatar({ prenom = "", nom = "" }) {
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "?";
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {initiales}
    </div>
  );
}

function StatutBadge({ actif }) {
  const ok = Number(actif) === 1;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: ok ? "rgba(22,163,74,0.1)" : "rgba(138,112,96,0.12)", color: ok ? "#16a34a" : "#8a7060" }}>
      {ok ? "Actif" : "Inactif"}
    </span>
  );
}

const thStyle = { padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "16px 24px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

const FORM_VIDE = { nom: "", prenom: "", dateNaissance: "", sexe: "1", lieuNaissance: "", langue: "", groupeSanguin: "", idVilleNaissance: "", idSalle: "", idAca: "", photoURL: "" };
const GROUPES_SANGUINS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PARENT_VIDE = { nom: "", prenom: "", username: "", mobile: "" };

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR");
  } catch {
    return d;
  }
}

export default function StudentsPage() {
  const { user } = useAuth();
  const { anneeId, annee } = useActiveYear();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [villes, setVilles] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);

  // Modal d'inscription
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [seedEnCours, setSeedEnCours] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, impact: [], message: "" });

  // Modal "Réaffectation" (changement de classe/salle)
  const [reaff, setReaff] = useState(null); // l'élève concerné
  const [reaffFreq, setReaffFreq] = useState([]); // affectations existantes
  const [loadingReaff, setLoadingReaff] = useState(false);
  const [reaffForm, setReaffForm] = useState({ idAca: "", idClasse: "", idSalle: "", commentaire: "" });
  const [reaffBusy, setReaffBusy] = useState(false);
  const [reaffErr, setReaffErr] = useState("");

  // Modal "Parents" (création + rattachement)
  const [parentsEleve, setParentsEleve] = useState(null); // l'élève concerné
  const [parentsListe, setParentsListe] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [parentForm, setParentForm] = useState(PARENT_VIDE);
  const [envoiParent, setEnvoiParent] = useState(false);
  const [parentErreur, setParentErreur] = useState("");

  const charger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Filtrage par année active : affectés cette année + non encore affectés.
      const data = anneeId ? await getElevesByAnnee(anneeId) : await getEleves();
      setEleves(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur de chargement des élèves.");
    } finally {
      setLoading(false);
    }
  }, [anneeId]);

  const chargerVilles = useCallback(async () => {
    try {
      const data = await getVilles();
      setVilles(Array.isArray(data) ? data : []);
    } catch {
      setVilles([]);
    }
  }, []);

  useEffect(() => {
    charger();
    chargerVilles();
    getSalles().then((s) => setSalles(Array.isArray(s) ? s : [])).catch(() => setSalles([]));
    getAnnees().then((a) => setAnnees(Array.isArray(a) ? a : [])).catch(() => setAnnees([]));
  }, [charger, chargerVilles]);

  const initialiserVilles = async () => {
    setSeedEnCours(true);
    setFormErreur("");
    try {
      await seedVilles();
      await chargerVilles();
    } catch (e) {
      setFormErreur(e.message || "Échec de l'initialisation des villes.");
    } finally {
      setSeedEnCours(false);
    }
  };

  // Filtrage côté client (nom / prénom)
  const elevesFiltres = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eleves;
    return eleves.filter(
      (e) =>
        `${e.prenom} ${e.nom}`.toLowerCase().includes(q) ||
        String(e.matricule).includes(q),
    );
  }, [eleves, query]);

  const majForm = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const soumettre = async (ev) => {
    ev.preventDefault();
    setFormErreur("");

    if (!form.nom || !form.prenom || !form.dateNaissance) {
      setFormErreur("Nom, prénom et date de naissance sont obligatoires.");
      return;
    }
    if (!form.idVilleNaissance) {
      setFormErreur("La ville de naissance est obligatoire.");
      return;
    }

    // Construit le payload en n'envoyant que les champs renseignés
    const payload = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      dateNaissance: form.dateNaissance,
      sexe: Number(form.sexe),
    };
    if (form.lieuNaissance.trim()) payload.lieuNaissance = form.lieuNaissance.trim();
    if (form.langue.trim()) payload.langue = form.langue.trim();
    if (form.groupeSanguin) payload.groupeSanguin = form.groupeSanguin;
    if (form.idVilleNaissance) payload.idVilleNaissance = Number(form.idVilleNaissance);
    if (form.photoURL) payload.photoURL = form.photoURL;
    // L'élève est rattaché à l'admin connecté
    if (user?.role === "admin" && user?.id) payload.idAdmin = Number(user.id);

    const idAdmin = user?.role === "admin" && user?.id ? Number(user.id) : undefined;

    setEnvoi(true);
    try {
      const eleve = await createEleve(payload);
      // Affectation à une classe (salle) pour une année, si choisies
      if (form.idSalle && form.idAca && eleve?.matricule) {
        try {
          await affecterEleve({
            matricule: Number(eleve.matricule),
            idSalle: Number(form.idSalle),
            idAcademi: Number(form.idAca),
            idAdmin,
          });
        } catch (errAff) {
          // L'élève est créé ; on signale juste l'échec d'affectation
          setFormErreur("Élève créé, mais affectation à la classe échouée : " + (errAff.message || ""));
        }
      }
      setModalOuvert(false);
      setForm(FORM_VIDE);
      await charger();
    } catch (e) {
      setFormErreur(e.message || "Échec de l'inscription.");
    } finally {
      setEnvoi(false);
    }
  };

  const handleSupprimerEleve = (eleve) => {
    setDeleteModal({ isOpen: true, item: eleve, impact: [], message: `Voulez-vous vraiment supprimer l'élève ${eleve.prenom} ${eleve.nom} ? Cette action est irréversible.` });
  };

  const executeDelete = async () => {
    const { item, impact } = deleteModal;
    const force = impact && impact.length > 0;
    
    setBusyId(item.matricule);
    setError("");
    try {
      await deleteEleve(item.matricule, force);
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, item: null, impact: [], message: "" });
      await charger();
    } catch (err) {
      if (err.requireConfirmation) {
         setDeleteModal({ ...deleteModal, impact: err.impact, message: err.message });
      } else {
         setError(err.message || "Échec de la suppression.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const desactiver = async (e) => {
    setBusyId(e.matricule);
    setError("");
    try {
      await desactiverEleve(e.matricule);
      await charger();
    } catch (err) {
      setError(err.message || "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const reactiver = async (e) => {
    setBusyId(e.matricule);
    setError("");
    try {
      await activerEleve(e.matricule);
      await charger();
    } catch (err) {
      setError(err.message || "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  // ── Gestion des parents d'un élève ──
  const ouvrirParents = async (eleve) => {
    setParentsEleve(eleve);
    setParentForm(PARENT_VIDE);
    setParentErreur("");
    setLoadingParents(true);
    try {
      const data = await getParentsEleve(eleve.matricule);
      setParentsListe(Array.isArray(data) ? data : []);
    } catch {
      setParentsListe([]);
    } finally {
      setLoadingParents(false);
    }
  };

  const majParent = (champ, valeur) => setParentForm((f) => ({ ...f, [champ]: valeur }));

  const soumettreParent = async (ev) => {
    ev.preventDefault();
    setParentErreur("");
    const { nom, prenom, username } = parentForm;
    if (!nom || !prenom || !username) {
      setParentErreur("Nom, prénom et email sont obligatoires.");
      return;
    }
    setEnvoiParent(true);
    try {
      // 1) Créer le compte Personne (typePersonne = 4 = Parent ; mot de passe généré et envoyé par email)
      const personne = await createPersonne({
        nom: nom.trim(),
        prenom: prenom.trim(),
        username: username.trim(),
        typePersonne: 4,
        mobile: parentForm.mobile.trim() || undefined,
        idAdmin: user?.role === "admin" && user?.id ? Number(user.id) : undefined,
      });
      // 2) Rattacher ce parent à l'élève
      await addParentToEleve(parentsEleve.matricule, { idPers: personne.idPers });
      // 3) Recharger la liste des parents
      setParentForm(PARENT_VIDE);
      const data = await getParentsEleve(parentsEleve.matricule);
      setParentsListe(Array.isArray(data) ? data : []);
      // L'email d'identifiants est garanti envoyé : en cas d'échec, le backend
      // aurait levé une erreur (503) et ni le parent ni le rattachement n'existeraient.
    } catch (e) {
      setParentErreur(e.message || "Échec de la création du parent.");
    } finally {
      setEnvoiParent(false);
    }
  };

  // ── Export CSV de la liste (filtrée) ──
  const exporter = () => {
    exporterCSV(
      elevesFiltres,
      [
        { key: "matricule", label: "Matricule" },
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { get: (e) => (Number(e.sexe) === 2 ? "Féminin" : "Masculin"), label: "Sexe" },
        { get: (e) => (e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString("fr-FR") : ""), label: "Naissance" },
        { get: (e) => (Number(e.actif) === 1 ? "Actif" : "Inactif"), label: "Statut" },
      ],
      `eleves_${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  // ── Réaffectation (changement de classe/salle) ──
  const classesDispo = useMemo(() => {
    const map = new Map();
    for (const s of salles) { if (s.classe) map.set(s.classe.idClasse, s.classe); }
    return [...map.values()];
  }, [salles]);

  const sallesDeClasse = useMemo(
    () => salles.filter((s) => String(s.classe?.idClasse) === String(reaffForm.idClasse)),
    [salles, reaffForm.idClasse],
  );

  const ouvrirReaff = async (eleve) => {
    setReaff(eleve);
    setReaffErr("");
    const anneeRecente = annees.reduce((acc, a) => (!acc || Number(a.idAnnee) > Number(acc.idAnnee) ? a : acc), null);
    setReaffForm({ idAca: anneeRecente ? String(anneeRecente.idAnnee) : "", idClasse: "", idSalle: "", commentaire: "" });
    setLoadingReaff(true);
    try {
      const data = await getFrequenteByEleve(eleve.matricule);
      setReaffFreq(Array.isArray(data) ? data : []);
    } catch { setReaffFreq([]); }
    finally { setLoadingReaff(false); }
  };

  const majReaff = (champ, valeur) => setReaffForm((f) => {
    const next = { ...f, [champ]: valeur };
    if (champ === "idClasse") next.idSalle = ""; // reset salle quand la classe change
    return next;
  });

  const soumettreReaff = async (ev) => {
    ev.preventDefault();
    setReaffErr("");
    if (!reaffForm.idAca) { setReaffErr("Choisis l'année académique."); return; }
    if (!reaffForm.idSalle) { setReaffErr("Choisis la nouvelle salle."); return; }
    setReaffBusy(true);
    try {
      await reaffecterEleve({
        matricule: Number(reaff.matricule),
        idSalle: Number(reaffForm.idSalle),
        idAcademi: Number(reaffForm.idAca),
        commentaire: reaffForm.commentaire.trim() || undefined,
        idAdmin: user?.role === "admin" && user?.id ? Number(user.id) : undefined,
      });
      const data = await getFrequenteByEleve(reaff.matricule);
      setReaffFreq(Array.isArray(data) ? data : []);
      setReaffForm((f) => ({ ...f, idClasse: "", idSalle: "", commentaire: "" }));
    } catch (e) { setReaffErr(e.message || "Échec de la réaffectation."); }
    finally { setReaffBusy(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <GraduationCap size={28} style={{ color: "var(--orange)" }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
            Élèves
          </h1>
          <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>
            {eleves.length}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={exporter}
            disabled={elevesFiltres.length === 0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 12, border: "1px solid var(--surface-border)", cursor: elevesFiltres.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "var(--surface)", color: "var(--text-dark)" }}
          >
            <Download size={16} /> Exporter CSV
          </button>
          <button
            onClick={() => { setForm(FORM_VIDE); setFormErreur(""); setModalOuvert(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", boxShadow: "0 4px 12px rgba(216,99,16,0.25)" }}
          >
            <UserPlus size={16} /> Inscrire un élève
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 420 }}>
        <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou matricule…"
          style={{ ...inputStyle, paddingLeft: 40 }}
        />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Tableau */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Élève</th>
                <th style={thStyle}>Matricule</th>
                <th style={thStyle}>Sexe</th>
                <th style={thStyle}>Naissance</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {elevesFiltres.length === 0 ? (
                <tr>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={6}>
                    {eleves.length === 0 ? "Aucun élève inscrit." : "Aucun résultat pour cette recherche."}
                  </td>
                </tr>
              ) : (
                elevesFiltres.map((e) => (
                  <tr key={e.matricule}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar prenom={e.prenom} nom={e.nom} />
                        <span style={{ fontWeight: 600 }}>{e.prenom} {e.nom}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{e.matricule}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{Number(e.sexe) === 2 ? "Féminin" : "Masculin"}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{formatDate(e.dateNaissance)}</td>
                    <td style={tdStyle}><StatutBadge actif={e.actif} /></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                        <Link
                          href={`/dashboard/director/eleve/${e.matricule}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textDecoration: "none" }}
                        >
                          <Eye size={14} />
                          Fiche
                        </Link>
                        <button
                          onClick={() => ouvrirParents(e)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <Users size={14} />
                          Parents
                        </button>
                        <button
                          onClick={() => ouvrirReaff(e)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <Repeat size={14} />
                          Classe
                        </button>
                        {Number(e.actif) === 1 ? (
                          <button
                            onClick={() => desactiver(e)}
                            disabled={busyId === e.matricule}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            <PowerOff size={14} />
                            {busyId === e.matricule ? "…" : "Désactiver"}
                          </button>
                        ) : (
                          <button
                            onClick={() => reactiver(e)}
                            disabled={busyId === e.matricule}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#16a34a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            <Power size={14} />
                            {busyId === e.matricule ? "…" : "Réactiver"}
                          </button>
                        )}
                        <button
                          onClick={() => handleSupprimerEleve(e)}
                          disabled={busyId === e.matricule}
                          title="Supprimer définitivement l'élève"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <Trash2 size={14} />
                          {busyId === e.matricule ? "…" : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal d'inscription ── */}
      {modalOuvert && (
        <div
          onClick={() => !envoi && setModalOuvert(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 20px", zIndex: 1000, overflowY: "auto" }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, margin: "auto", background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
                Inscrire un élève
              </h2>
              <button onClick={() => !envoi && setModalOuvert(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={soumettre}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} value={form.nom} onChange={(e) => majForm("nom", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} value={form.prenom} onChange={(e) => majForm("prenom", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Date de naissance *</label>
                  <input type="date" style={inputStyle} value={form.dateNaissance} onChange={(e) => majForm("dateNaissance", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Sexe *</label>
                  <select style={inputStyle} value={form.sexe} onChange={(e) => majForm("sexe", e.target.value)}>
                    <option value="1">Masculin</option>
                    <option value="2">Féminin</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Lieu de naissance</label>
                  <input style={inputStyle} value={form.lieuNaissance} onChange={(e) => majForm("lieuNaissance", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Langue</label>
                  <input style={inputStyle} value={form.langue} onChange={(e) => majForm("langue", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Groupe sanguin</label>
                  <select style={inputStyle} value={form.groupeSanguin} onChange={(e) => majForm("groupeSanguin", e.target.value)}>
                    <option value="">— Non renseigné —</option>
                    {GROUPES_SANGUINS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Ville de naissance *</label>
                  {villes.length > 0 ? (
                    <select style={inputStyle} value={form.idVilleNaissance} onChange={(e) => majForm("idVilleNaissance", e.target.value)}>
                      <option value="">— Choisir une ville —</option>
                      {villes.map((v) => (
                        <option key={v.idVille} value={v.idVille}>{v.libelle}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={initialiserVilles}
                      disabled={seedEnCours}
                      style={{ ...inputStyle, cursor: "pointer", textAlign: "left", color: "var(--orange)", fontWeight: 600 }}
                    >
                      {seedEnCours ? "Initialisation…" : "Aucune ville — cliquer pour initialiser le référentiel"}
                    </button>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Classe (salle) — affectation</label>
                  <select style={inputStyle} value={form.idSalle} onChange={(e) => majForm("idSalle", e.target.value)}>
                    <option value="">— Aucune pour l'instant —</option>
                    {salles.map((s) => (
                      <option key={s.idSalle} value={s.idSalle}>{s.libelle} — {s.classe?.libelle || "sans classe"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Année académique</label>
                  <select style={inputStyle} value={form.idAca} onChange={(e) => majForm("idAca", e.target.value)}>
                    <option value="">— Choisir —</option>
                    {annees.map((a) => (
                      <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Photo de l'élève</label>
                <FileUpload value={form.photoURL} onUploaded={(url) => majForm("photoURL", url)} accept="image/*" apercu label="Choisir une photo" />
              </div>

              <p style={{ fontSize: 12, color: "#8a7060", marginTop: 10 }}>
                * champs obligatoires. L'affectation à une classe (salle + année) est facultative ici et peut se faire plus tard.
              </p>

              {formErreur && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>
                  {formErreur}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOuvert(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Annuler
                </button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {envoi ? "Enregistrement…" : "Inscrire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Réaffectation (changement de classe/salle) ── */}
      {reaff && (
        <div onClick={() => !reaffBusy && setReaff(null)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Changer de classe</h2>
              <button onClick={() => !reaffBusy && setReaff(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={22} /></button>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
              Élève : <b>{reaff.prenom} {reaff.nom}</b> (#{reaff.matricule})
            </p>

            {/* Affectations actuelles */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#4a3728", marginBottom: 10 }}>Affectation(s) actuelle(s)</h3>
              {loadingReaff ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</div>
              ) : reaffFreq.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Aucune affectation pour le moment.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {reaffFreq.map((f) => (
                    <div key={f.idFrequente} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#faf9f7", border: "1px solid var(--surface-border)" }}>
                      <div style={{ fontSize: 14 }}>
                        <b>{f.salle?.libelle || "—"}</b> — {f.salle?.classe?.libelle || "sans classe"}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.anneeAcademique?.libelle || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire de réaffectation */}
            <form onSubmit={soumettreReaff}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#4a3728", marginBottom: 12 }}>Nouvelle affectation</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Année académique *</label>
                  <select style={inputStyle} value={reaffForm.idAca} onChange={(e) => majReaff("idAca", e.target.value)}>
                    <option value="">— Choisir —</option>
                    {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Classe *</label>
                  <select style={inputStyle} value={reaffForm.idClasse} onChange={(e) => majReaff("idClasse", e.target.value)}>
                    <option value="">— Choisir —</option>
                    {classesDispo.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Salle * {reaffForm.idClasse && sallesDeClasse.length === 0 ? "(aucune salle pour cette classe)" : ""}</label>
                  <select style={inputStyle} value={reaffForm.idSalle} onChange={(e) => majReaff("idSalle", e.target.value)} disabled={!reaffForm.idClasse}>
                    <option value="">{reaffForm.idClasse ? "— Choisir une salle —" : "Choisis d'abord une classe"}</option>
                    {sallesDeClasse.map((s) => <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Motif (optionnel)</label>
                  <input style={inputStyle} value={reaffForm.commentaire} onChange={(e) => majReaff("commentaire", e.target.value)} placeholder="ex : changement de niveau, classe pleine…" />
                </div>
              </div>

              <p style={{ fontSize: 12, color: "#8a7060", marginTop: 12 }}>
                ℹ️ L'affectation de l'année choisie est <b>mise à jour</b> (pas de doublon). Si l'élève n'a pas encore d'affectation cette année, elle est créée.
              </p>

              {reaffErr && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{reaffErr}</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
                <button type="button" onClick={() => setReaff(null)} disabled={reaffBusy} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Fermer</button>
                <button type="submit" disabled={reaffBusy} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: reaffBusy ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: reaffBusy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {reaffBusy ? "Enregistrement…" : "Réaffecter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Parents (création + rattachement) ── */}
      {parentsEleve && (
        <div
          onClick={() => !envoiParent && setParentsEleve(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
                Parents
              </h2>
              <button onClick={() => !envoiParent && setParentsEleve(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}>
                <X size={22} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
              Élève : <b>{parentsEleve.prenom} {parentsEleve.nom}</b> (#{parentsEleve.matricule})
            </p>

            {/* Liste des parents existants */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#4a3728", marginBottom: 10 }}>Parents rattachés</h3>
              {loadingParents ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Chargement…</div>
              ) : parentsListe.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>Aucun parent rattaché pour l'instant.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {parentsListe.map((p) => (
                    <div key={p.idParent} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#faf9f7", border: "1px solid var(--surface-border)" }}>
                      <Avatar prenom={p.personne?.prenom} nom={p.personne?.nom} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.personne?.prenom} {p.personne?.nom}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {p.personne?.username}{p.personne?.mobile && p.personne.mobile !== "000" ? ` · ${p.personne.mobile}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulaire création + rattachement */}
            <form onSubmit={soumettreParent}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#4a3728", marginBottom: 12 }}>Créer et rattacher un parent</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} value={parentForm.nom} onChange={(e) => majParent("nom", e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} value={parentForm.prenom} onChange={(e) => majParent("prenom", e.target.value)} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" style={inputStyle} value={parentForm.username} onChange={(e) => majParent("username", e.target.value)} placeholder="ex : prenom.nom@gmail.com" />
                </div>
                <div>
                  <label style={labelStyle}>Mobile</label>
                  <input style={inputStyle} value={parentForm.mobile} onChange={(e) => majParent("mobile", e.target.value)} placeholder="Optionnel" />
                </div>
              </div>

              <p style={{ fontSize: 12, color: "#8a7060", marginTop: 12 }}>
                ℹ️ Le mot de passe est généré et envoyé par email au parent (modifiable ensuite depuis son espace).
              </p>

              {parentErreur && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>
                  {parentErreur}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 22 }}>
                <button type="button" onClick={() => setParentsEleve(null)} disabled={envoiParent} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Fermer
                </button>
                <button type="submit" disabled={envoiParent} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoiParent ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoiParent ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {envoiParent ? "Création…" : "Créer et rattacher"}
                </button>
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
        onClose={() => setDeleteModal({ isOpen: false, item: null, impact: [], message: "" })}
        onConfirm={executeDelete}
      />
    </div>
  );
}
