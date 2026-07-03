"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import ManagerOnly from "@/components/ManagerOnly";
import {
  getEnseignants,
  getTitulaires,
  activerEnseignant,
  desactiverEnseignant,
  desactiverTitulaire,
  createPersonne,
  createEnseignant,
  createTitulaire,
  getCours,
  getClasses,
  getPersonnesTous,
  getSalles,
  getAdmins,
  createAdmin,
  deletePersonne,
  deleteAdmin,
} from "@/lib/api";
import { Users, GraduationCap, UserCheck, Power, PowerOff, UserPlus, X, MapPin, Shield, Trash2 } from "lucide-react";

// Libellés de rôle (Personne.typePersonne et Admin.typeAdmin)
const TYPE_PERSONNE = { 1: "Enseignant", 2: "Administratif", 3: "Scolarité", 4: "Parent", 5: "Autres" };
const TYPE_ADMIN = { 0: "Root", 1: "Admin", 2: "Fondateur", 3: "Directeur" };

const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };
const STAFF_VIDE = { nom: "", prenom: "", username: "", mobile: "", typePersonne: "1", idClasse: "", idSalle: "", idCours: "" };

// Avatar à initiales
function Avatar({ prenom = "", nom = "" }) {
  const initiales = `${prenom[0] || ""}${nom[0] || ""}`.toUpperCase() || "?";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--orange), var(--brown))",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initiales}
    </div>
  );
}

function StatutBadge({ actif }) {
  const ok = Number(actif) === 1;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: ok ? "rgba(22,163,74,0.1)" : "rgba(138,112,96,0.12)",
        color: ok ? "#16a34a" : "#8a7060",
      }}
    >
      {ok ? "Actif" : "Inactif"}
    </span>
  );
}

const thStyle = {
  padding: "16px 24px",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--muted)",
  textAlign: "left",
  borderBottom: "1px solid var(--surface-border)",
};
const tdStyle = {
  padding: "16px 24px",
  fontSize: 14,
  color: "var(--text-dark)",
  borderBottom: "1px solid var(--surface-border)",
};

export default function StaffPageGuarded() {
  return <ManagerOnly><StaffPage /></ManagerOnly>;
}

function StaffPage() {
  const { user } = useAuth();
  const idAdmin = user?.role === "admin" && user?.id ? Number(user.id) : undefined;

  const [tab, setTab] = useState("enseignants"); // 'enseignants' | 'titulaires'
  const [enseignants, setEnseignants] = useState([]);
  const [titulaires, setTitulaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null); // id en cours d'action

  // Modal "Nouveau membre du personnel"
  const [modalOuvert, setModalOuvert] = useState(false);
  const [cours, setCours] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(STAFF_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");

  // Modal "Nouveau compte admin"
  const [adminModal, setAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ nom: "", username: "", typeAdmin: "", mobile: "" });
  const [adminErreur, setAdminErreur] = useState("");

  // Modal "Affecter un titulaire"
  const [titModal, setTitModal] = useState(false);
  const [personnes, setPersonnes] = useState([]);
  const [salles, setSalles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [titForm, setTitForm] = useState({ idPers: "", idSalle: "" });
  const [titErreur, setTitErreur] = useState("");

  const charger = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ens, tit] = await Promise.all([getEnseignants(), getTitulaires()]);
      setEnseignants(Array.isArray(ens) ? ens : []);
      setTitulaires(Array.isArray(tit) ? tit : []);
    } catch (e) {
      setError(e.message || "Erreur de chargement du personnel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
    getCours().then((c) => setCours(Array.isArray(c) ? c : [])).catch(() => setCours([]));
    getClasses().then((c) => setClasses(Array.isArray(c) ? c : [])).catch(() => setClasses([]));
    getPersonnesTous().then((p) => setPersonnes(Array.isArray(p) ? p : [])).catch(() => setPersonnes([]));
    getSalles().then((s) => setSalles(Array.isArray(s) ? s : [])).catch(() => setSalles([]));
    getAdmins().then((a) => setAdmins(Array.isArray(a) ? a : [])).catch(() => setAdmins([]));
  }, [charger]);

  const soumettreTitulaire = async (ev) => {
    ev.preventDefault();
    setTitErreur("");
    if (!titForm.idPers || !titForm.idSalle) { setTitErreur("Choisis une personne et une salle."); return; }
    setEnvoi(true);
    try {
      await createTitulaire({ idPers: Number(titForm.idPers), idSalle: Number(titForm.idSalle), idAdmin });
      setTitModal(false);
      setTitForm({ idPers: "", idSalle: "" });
      await charger();
    } catch (e) {
      setTitErreur(e.message || "Échec de l'affectation.");
    } finally {
      setEnvoi(false);
    }
  };

  // Root (0) et Fondateur (2) peuvent supprimer n'importe qui, y compris des admins
  const estRootOuFondateur = user?.role === "admin" && [0, 2].includes(Number(user?.typeRole));

  // Types d'admin que le compte connecté peut créer
  // Root (0) → Fondateur, Directeur, Admin standard ; Fondateur (2) → Directeur, Admin standard
  const typesAdminCreables =
    user?.role === "admin" && Number(user?.typeRole) === 0
      ? [{ v: 2, label: "Fondateur" }, { v: 3, label: "Directeur" }, { v: 1, label: "Admin standard" }]
      : user?.role === "admin" && Number(user?.typeRole) === 2
      ? [{ v: 3, label: "Directeur" }, { v: 1, label: "Admin standard" }]
      : [];

  const soumettreAdmin = async (ev) => {
    ev.preventDefault();
    setAdminErreur("");
    const { nom, username, typeAdmin } = adminForm;
    if (!nom.trim() || !username.trim() || !typeAdmin) {
      setAdminErreur("Nom, email et type sont obligatoires.");
      return;
    }
    setEnvoi(true);
    try {
      const cree = await createAdmin({
        nom: nom.trim(),
        username: username.trim(),
        typeAdmin: Number(typeAdmin),
        mobile: adminForm.mobile.trim() || undefined,
      });
      setAdminModal(false);
      setAdminForm({ nom: "", username: "", typeAdmin: "", mobile: "" });
      setAdmins(await getAdmins());
      if (cree?.emailEnvoye === false) {
        setError(`Compte admin créé, mais l'email n'a pas pu être envoyé à « ${username.trim()} ». Vérifiez l'adresse email.`);
      }
    } catch (e) {
      setAdminErreur(e.message || "Échec de la création du compte admin.");
    } finally {
      setEnvoi(false);
    }
  };

  const supprimerPersonne = async (p) => {
    if (typeof window !== "undefined" && !window.confirm(`Supprimer le compte de ${p.prenom} ${p.nom} ?`)) return;
    setBusyId(`per-${p.idPers}`); setError("");
    try {
      await deletePersonne(p.idPers);
      setPersonnes(await getPersonnesTous());
    } catch (e) { setError(e.message || "Suppression impossible."); }
    finally { setBusyId(null); }
  };

  const supprimerAdmin = async (a) => {
    if (typeof window !== "undefined" && !window.confirm(`Supprimer l'administrateur ${a.nom} ?`)) return;
    setBusyId(`adm-${a.ID}`); setError("");
    try {
      await deleteAdmin(a.ID);
      setAdmins(await getAdmins());
    } catch (e) { setError(e.message || "Suppression impossible."); }
    finally { setBusyId(null); }
  };

  const majForm = (champ, val) => setForm((f) => ({ ...f, [champ]: val }));

  const soumettreMembre = async (ev) => {
    ev.preventDefault();
    setFormErreur("");
    const { nom, prenom, username, typePersonne, idClasse, idCours } = form;
    if (!nom || !prenom || !username) {
      setFormErreur("Nom, prénom et email sont obligatoires.");
      return;
    }
    if (Number(typePersonne) === 1 && !idClasse) { setFormErreur("Choisis la classe de l'enseignant."); return; }

    setEnvoi(true);
    try {
      // 1) Créer le compte Personne (le mot de passe est généré et envoyé par email)
      const personne = await createPersonne({
        nom: nom.trim(), prenom: prenom.trim(), username: username.trim(),
        typePersonne: Number(typePersonne),
        mobile: form.mobile.trim() || undefined,
        idAdmin,
      });
      // 2) Si enseignant : l'enregistrer pour une CLASSE (+ matière de difficulté optionnelle)
      if (Number(typePersonne) === 1) {
        await createEnseignant({
          idPers: personne.idPers,
          idClasse: Number(idClasse),
          idCours: idCours ? Number(idCours) : undefined,
          idAdmin,
        });
      }
      setModalOuvert(false);
      setForm(STAFF_VIDE);
      await charger();
      // Alerte si l'email d'identifiants n'a pas pu partir
      if (personne?.emailEnvoye === false) {
        setError(`Compte créé, mais l'email d'identifiants n'a pas pu être envoyé à « ${username.trim()} ». Vérifiez l'adresse email.`);
      }
    } catch (e) {
      setFormErreur(e.message || "Échec de la création du membre.");
    } finally {
      setEnvoi(false);
    }
  };

  // Activer / désactiver un enseignant
  const toggleEnseignant = async (e) => {
    setBusyId(`ens-${e.idEnseignant}`);
    setError("");
    try {
      if (Number(e.actif) === 1) await desactiverEnseignant(e.idEnseignant);
      else await activerEnseignant(e.idEnseignant);
      await charger();
    } catch (err) {
      setError(err.message || "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  // Désactiver un titulaire (pas de route "activer" côté API)
  const desactiverTit = async (tit) => {
    setBusyId(`tit-${tit.idTitulaire}`);
    setError("");
    try {
      await desactiverTitulaire(tit.idTitulaire);
      await charger();
    } catch (err) {
      setError(err.message || "Action impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const personnelNonParent = personnes.filter((p) => Number(p.typePersonne) !== 4);
  const tabs = [
    { key: "tous", label: "Tout le personnel", icon: <Users size={16} />, count: personnelNonParent.length + admins.length },
    { key: "enseignants", label: "Enseignants", icon: <GraduationCap size={16} />, count: enseignants.length },
    { key: "titulaires", label: "Titulaires", icon: <UserCheck size={16} />, count: titulaires.length },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Users size={28} style={{ color: "var(--orange)" }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
            Personnel
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {estRootOuFondateur && (
            <button
              onClick={() => { setAdminForm({ nom: "", username: "", typeAdmin: "", mobile: "" }); setAdminErreur(""); setAdminModal(true); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "1px solid var(--surface-border)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "var(--surface)", color: "#2563eb" }}
            >
              <Shield size={16} /> Nouveau compte admin
            </button>
          )}
          <button
            onClick={() => { setTitForm({ idPers: "", idSalle: "" }); setTitErreur(""); setTitModal(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "1px solid var(--surface-border)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "var(--surface)", color: "var(--orange)" }}
          >
            <MapPin size={16} /> Affecter un titulaire
          </button>
          <button
            onClick={() => { setForm(STAFF_VIDE); setFormErreur(""); setModalOuvert(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", boxShadow: "0 4px 12px rgba(216,99,16,0.25)" }}
          >
            <UserPlus size={16} /> Nouveau membre
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)",
                color: active ? "white" : "var(--muted)",
                boxShadow: active ? "0 4px 12px rgba(216,99,16,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              {tb.icon}
              {tb.label}
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  background: active ? "rgba(255,255,255,0.25)" : "rgba(216,99,16,0.1)",
                  color: active ? "white" : "var(--orange)",
                }}
              >
                {tb.count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Tableau */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : tab === "tous" ? (
          <div>
            <div style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} style={{ color: "var(--orange)" }} /> Personnel ({personnelNonParent.length})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Nom</th><th style={thStyle}>Rôle</th><th style={thStyle}>Email</th><th style={thStyle}>Mobile</th><th style={{ ...thStyle, textAlign: "right" }}>Action</th></tr></thead>
              <tbody>
                {personnelNonParent.length === 0 ? (
                  <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={5}>Aucun membre du personnel.</td></tr>
                ) : personnelNonParent.map((p) => (
                  <tr key={p.idPers}>
                    <td style={tdStyle}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><Avatar prenom={p.prenom} nom={p.nom} /><span style={{ fontWeight: 600 }}>{p.prenom} {p.nom}</span></div></td>
                    <td style={tdStyle}><span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 999, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>{TYPE_PERSONNE[p.typePersonne] || "—"}</span></td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.username}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.mobile && p.mobile !== "000" ? p.mobile : "—"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button onClick={() => supprimerPersonne(p)} disabled={busyId === `per-${p.idPers}`} title="Supprimer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        <Trash2 size={14} /> {busyId === `per-${p.idPers}` ? "…" : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px 24px", fontSize: 13, fontWeight: 700, color: "var(--text-dark)", borderTop: "1px solid var(--surface-border)", borderBottom: "1px solid var(--surface-border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={16} style={{ color: "var(--orange)" }} /> Administrateurs ({admins.length})
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Nom</th><th style={thStyle}>Type</th><th style={thStyle}>Identifiant</th><th style={{ ...thStyle, textAlign: "right" }}>Action</th></tr></thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={4}>Aucun administrateur.</td></tr>
                ) : admins.map((a) => (
                  <tr key={a.ID}>
                    <td style={tdStyle}><span style={{ fontWeight: 600 }}>{a.nom}</span></td>
                    <td style={tdStyle}><span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 999, background: "rgba(37,99,235,0.1)", color: "#2563eb" }}>{TYPE_ADMIN[a.typeAdmin] ?? "Admin"}</span></td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{a.username}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {estRootOuFondateur && Number(a.ID) !== Number(user?.id) && !(Number(user?.typeRole) === 2 && Number(a.typeAdmin) === 0) ? (
                        <button onClick={() => supprimerAdmin(a)} disabled={busyId === `adm-${a.ID}`} title="Supprimer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          <Trash2 size={14} /> {busyId === `adm-${a.ID}` ? "…" : "Supprimer"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "#b8a9a0" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tab === "enseignants" ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Enseignant</th>
                <th style={thStyle}>Classe gérée</th>
                <th style={thStyle}>Matière de difficulté</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enseignants.length === 0 ? (
                <tr>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={5}>
                    Aucun enseignant enregistré.
                  </td>
                </tr>
              ) : (
                enseignants.map((e) => (
                  <tr key={e.idEnseignant}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar prenom={e.personne?.prenom} nom={e.personne?.nom} />
                        <span style={{ fontWeight: 600 }}>
                          {e.personne?.prenom} {e.personne?.nom}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{e.classe?.libelle || "—"}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{e.cours?.libelle || "Aucune"}</td>
                    <td style={tdStyle}><StatutBadge actif={e.actif} /></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => toggleEnseignant(e)}
                        disabled={busyId === `ens-${e.idEnseignant}`}
                        style={actionBtnStyle(Number(e.actif) === 1)}
                      >
                        {Number(e.actif) === 1 ? <PowerOff size={14} /> : <Power size={14} />}
                        {busyId === `ens-${e.idEnseignant}` ? "…" : Number(e.actif) === 1 ? "Désactiver" : "Activer"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Titulaire</th>
                <th style={thStyle}>Mobile</th>
                <th style={thStyle}>Salle</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {titulaires.length === 0 ? (
                <tr>
                  <td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={5}>
                    Aucun titulaire enregistré.
                  </td>
                </tr>
              ) : (
                titulaires.map((tit) => (
                  <tr key={tit.idTitulaire}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Avatar prenom={tit.personne?.prenom} nom={tit.personne?.nom} />
                        <span style={{ fontWeight: 600 }}>
                          {tit.personne?.prenom} {tit.personne?.nom}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{tit.personne?.mobile || "—"}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{tit.salle?.libelle || "—"}</td>
                    <td style={tdStyle}><StatutBadge actif={tit.actif} /></td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => desactiverTit(tit)}
                        disabled={busyId === `tit-${tit.idTitulaire}` || Number(tit.actif) !== 1}
                        style={actionBtnStyle(true, Number(tit.actif) !== 1)}
                      >
                        <PowerOff size={14} />
                        {busyId === `tit-${tit.idTitulaire}` ? "…" : "Désactiver"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Nouveau membre du personnel ── */}
      {modalOuvert && (
        <div onClick={() => !envoi && setModalOuvert(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 540, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Nouveau membre du personnel</h2>
              <button onClick={() => !envoi && setModalOuvert(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={22} /></button>
            </div>

            <form onSubmit={soumettreMembre}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Nom *</label><input style={inputStyle} value={form.nom} onChange={(e) => majForm("nom", e.target.value)} /></div>
                <div><label style={labelStyle}>Prénom *</label><input style={inputStyle} value={form.prenom} onChange={(e) => majForm("prenom", e.target.value)} /></div>
                <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} value={form.username} onChange={(e) => majForm("username", e.target.value)} placeholder="ex : prenom.nom@gmail.com" /></div>
                <div><label style={labelStyle}>Mobile</label><input style={inputStyle} value={form.mobile} onChange={(e) => majForm("mobile", e.target.value)} placeholder="Optionnel" /></div>
                <div>
                  <label style={labelStyle}>Rôle *</label>
                  <select style={inputStyle} value={form.typePersonne} onChange={(e) => majForm("typePersonne", e.target.value)}>
                    <option value="1">Enseignant</option>
                    <option value="3">Scolarité</option>
                    <option value="2">Administratif</option>
                  </select>
                </div>
                {Number(form.typePersonne) === 1 && (
                  <>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Classe gérée *</label>
                      <select style={inputStyle} value={form.idClasse} onChange={(e) => setForm((f) => ({ ...f, idClasse: e.target.value, idSalle: "" }))}>
                        <option value="">— Choisir une classe —</option>
                        {classes.map((c) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                      </select>
                      {classes.length === 0 && <p style={{ fontSize: 12, color: "#8a7060", marginTop: 6 }}>Aucune classe — créez-en une dans « Cours & Classes ».</p>}
                    </div>
                    {form.idClasse && (
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Salle de la classe</label>
                        <select style={inputStyle} value={form.idSalle} onChange={(e) => majForm("idSalle", e.target.value)}>
                          <option value="">— Choisir une salle —</option>
                          {salles.filter((s) => String(s.classe?.idClasse) === String(form.idClasse)).map((s) => (
                            <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                          ))}
                        </select>
                        {salles.filter((s) => String(s.classe?.idClasse) === String(form.idClasse)).length === 0 && (
                          <p style={{ fontSize: 12, color: "#8a7060", marginTop: 6 }}>Cette classe n'a pas encore de salle (Cours & Classes → Salles).</p>
                        )}
                      </div>
                    )}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Matière de difficulté (assurée par un autre)</label>
                      <select style={inputStyle} value={form.idCours} onChange={(e) => majForm("idCours", e.target.value)}>
                        <option value="">— Aucune (il donne toutes les matières) —</option>
                        {cours.map((c) => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <p style={{ fontSize: 12, color: "#8a7060", marginTop: 12 }}>
                ℹ️ Aucun mot de passe à saisir : il est généré automatiquement et envoyé par email à l'utilisateur, qui pourra le modifier ensuite.
              </p>

              {formErreur && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{formErreur}</div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOuvert(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Création…" : "Créer le membre"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Affecter un titulaire ── */}
      {titModal && (
        <div onClick={() => !envoi && setTitModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Affecter un titulaire</h2>
              <button onClick={() => !envoi && setTitModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={22} /></button>
            </div>
            <form onSubmit={soumettreTitulaire} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Personne *</label>
                <select style={inputStyle} value={titForm.idPers} onChange={(e) => setTitForm((s) => ({ ...s, idPers: e.target.value }))}>
                  <option value="">— Choisir une personne —</option>
                  {/* Un titulaire peut être n'importe quel membre du personnel, sauf un parent (type 4) */}
                  {personnes.filter((p) => Number(p.typePersonne) !== 4).map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Salle *</label>
                <select style={inputStyle} value={titForm.idSalle} onChange={(e) => setTitForm((s) => ({ ...s, idSalle: e.target.value }))}>
                  <option value="">— Choisir une salle —</option>
                  {salles.map((s) => <option key={s.idSalle} value={s.idSalle}>{s.libelle} — {s.classe?.libelle || "sans classe"}</option>)}
                </select>
                {salles.length === 0 && <p style={{ fontSize: 12, color: "#8a7060", marginTop: 6 }}>Aucune salle — créez-en une dans « Cours & Classes » → onglet Salles.</p>}
              </div>
              {titErreur && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{titErreur}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 6 }}>
                <button type="button" onClick={() => setTitModal(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Affectation…" : "Affecter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Nouveau compte admin (Root/Fondateur) ── */}
      {adminModal && (
        <div onClick={() => !envoi && setAdminModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Nouveau compte admin</h2>
              <button onClick={() => !envoi && setAdminModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={22} /></button>
            </div>
            <form onSubmit={soumettreAdmin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Nom complet *</label><input style={inputStyle} value={adminForm.nom} onChange={(e) => setAdminForm((s) => ({ ...s, nom: e.target.value }))} /></div>
              <div><label style={labelStyle}>Email *</label><input type="email" style={inputStyle} value={adminForm.username} onChange={(e) => setAdminForm((s) => ({ ...s, username: e.target.value }))} placeholder="ex : prenom.nom@gmail.com" /></div>
              <div>
                <label style={labelStyle}>Type de compte *</label>
                <select style={inputStyle} value={adminForm.typeAdmin} onChange={(e) => setAdminForm((s) => ({ ...s, typeAdmin: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {typesAdminCreables.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Mobile</label><input style={inputStyle} value={adminForm.mobile} onChange={(e) => setAdminForm((s) => ({ ...s, mobile: e.target.value }))} placeholder="Optionnel" /></div>
              <p style={{ fontSize: 12, color: "#8a7060" }}>ℹ️ Un mot de passe est généré et envoyé par email au nouvel administrateur.</p>
              {adminErreur && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{adminErreur}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setAdminModal(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Création…" : "Créer le compte"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function actionBtnStyle(isActive, disabled = false) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 10,
    border: "1px solid var(--surface-border)",
    background: disabled ? "#f1f0ee" : "var(--surface)",
    color: disabled ? "#b8a9a0" : isActive ? "#ef4444" : "#16a34a",
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  };
}
