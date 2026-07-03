"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { useActiveYear } from "@/context/ActiveYearContext";
import { imprimerRecu } from "@/lib/print";
import {
  getEleves, getPaiementsEleve, getModes, createModePaiement,
  getScolarites, createScolarite, createTranche, enregistrerPaiement, getArrieresAuto,
  getCycles, getAnnees, getPersonnesTous,
} from "@/lib/api";
import { CreditCard, Wallet, Plus, Receipt, GraduationCap, X, CalendarClock, Printer, FileText } from "lucide-react";
import BilanClasse from "./BilanClasse";

const thStyle = { padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 20px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

const fmt = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";
function formatDate(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return d; } }

export default function PaymentsPage() {
  const { user } = useAuth();
  const { anneeId } = useActiveYear();
  const [tab, setTab] = useState("versements");
  const [error, setError] = useState("");

  // Référentiels
  const [eleves, setEleves] = useState([]);
  const [modes, setModes] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [scolarites, setScolarites] = useState([]);

  // Versements
  const [matricule, setMatricule] = useState("");
  const [idAca, setIdAca] = useState("");
  const [paiements, setPaiements] = useState([]);
  const [arrieres, setArrieres] = useState(null);
  const [verModal, setVerModal] = useState(false);
  const [verForm, setVerForm] = useState({ montant: "", datePaie: "", idMode: "", idPers: "" });
  const [envoi, setEnvoi] = useState(false);
  const [verErreur, setVerErreur] = useState("");

  // Scolarité
  const [fScol, setFScol] = useState({ idCycle: "", inscription: "", pension: "", nbreTranche: "3", description: "" });
  const [fTranche, setFTranche] = useState({ idScolarite: "", libelle: "", montant: "", delai_mois: "", delai_jour: "" });

  // Modes
  const [nouveauMode, setNouveauMode] = useState({ libelle: "", information: "" });

  const chargerRef = useCallback(async () => {
    try {
      const [el, md, an, cy, pe, sc] = await Promise.all([
        getEleves(), getModes(), getAnnees(), getCycles(), getPersonnesTous(), getScolarites(),
      ]);
      setEleves(el || []); setModes(md || []); setAnnees(an || []);
      setCycles(cy || []); setPersonnes(pe || []); setScolarites(sc || []);
    } catch (e) { setError(e.message || "Erreur de chargement."); }
  }, []);

  useEffect(() => { chargerRef(); }, [chargerRef]);

  // Année active (TopNav) → pré-sélection par défaut du filtre année
  useEffect(() => { if (anneeId && !idAca) setIdAca(String(anneeId)); }, [anneeId, idAca]);

  // Charger paiements + arriérés de l'élève sélectionné.
  // Le cycle (donc les frais) est déduit automatiquement de la classe de l'élève côté backend.
  const rafraichirEleve = useCallback(async (mat, aca) => {
    if (!mat) { setPaiements([]); setArrieres(null); return; }
    try {
      const p = await getPaiementsEleve(mat);
      setPaiements(Array.isArray(p) ? p : []);
    } catch { setPaiements([]); }
    if (aca) {
      try { setArrieres(await getArrieresAuto(mat, aca)); }
      catch { setArrieres(null); }
    } else { setArrieres(null); }
  }, []);

  useEffect(() => { rafraichirEleve(matricule, idAca); }, [matricule, idAca, rafraichirEleve]);

  const total = paiements.reduce((acc, p) => acc + (Number(p.montant) || 0), 0);

  // ── Enregistrer un versement ──
  const soumettreVersement = async (e) => {
    e.preventDefault();
    setVerErreur("");
    if (!matricule) { setVerErreur("Sélectionne d'abord un élève."); return; }
    if (!idAca) { setVerErreur("Choisis l'année académique."); return; }
    if (!verForm.montant || !verForm.datePaie || !verForm.idMode || !verForm.idPers) {
      setVerErreur("Montant, date, mode et personne sont requis."); return;
    }
    setEnvoi(true);
    try {
      await enregistrerPaiement({
        matricule: Number(matricule),
        idAca: Number(idAca),
        idMode: Number(verForm.idMode),
        idPers: Number(verForm.idPers),
        montant: Number(verForm.montant),
        datePaie: verForm.datePaie,
      });
      setVerModal(false);
      setVerForm({ montant: "", datePaie: "", idMode: "", idPers: "" });
      await rafraichirEleve(matricule, idAca);
    } catch (err) { setVerErreur(err.message || "Échec de l'enregistrement."); }
    finally { setEnvoi(false); }
  };

  // ── Scolarité / tranches ──
  const ajouterScolarite = async (e) => {
    e.preventDefault();
    if (!fScol.idCycle || !fScol.inscription || !fScol.pension) { setError("Cycle, inscription et pension requis."); return; }
    setEnvoi(true); setError("");
    try {
      await createScolarite({
        idCycle: Number(fScol.idCycle),
        inscription: Number(fScol.inscription),
        pension: Number(fScol.pension),
        nbreTranche: Number(fScol.nbreTranche) || 3,
        description: fScol.description.trim() || "INDEFINI",
      });
      setFScol({ idCycle: "", inscription: "", pension: "", nbreTranche: "3", description: "" });
      setScolarites(await getScolarites());
    } catch (err) { setError(err.message || "Échec de la création."); }
    finally { setEnvoi(false); }
  };

  const ajouterTranche = async (e) => {
    e.preventDefault();
    if (!fTranche.idScolarite || !fTranche.libelle || !fTranche.montant) { setError("Scolarité, libellé et montant requis."); return; }
    setEnvoi(true); setError("");
    try {
      await createTranche({
        idScolarite: Number(fTranche.idScolarite),
        libelle: fTranche.libelle.trim(),
        montant: Number(fTranche.montant),
        delai_mois: fTranche.delai_mois.trim() || "00",
        delai_jour: fTranche.delai_jour.trim() || "00",
      });
      setFTranche({ idScolarite: "", libelle: "", montant: "", delai_mois: "", delai_jour: "" });
      setScolarites(await getScolarites());
    } catch (err) { setError(err.message || "Échec de la tranche."); }
    finally { setEnvoi(false); }
  };

  // ── Modes ──
  const ajouterMode = async (e) => {
    e.preventDefault();
    if (!nouveauMode.libelle.trim()) return;
    setEnvoi(true); setError("");
    try {
      await createModePaiement({ libelle: nouveauMode.libelle.trim(), information: nouveauMode.information.trim() || undefined });
      setNouveauMode({ libelle: "", information: "" });
      setModes(await getModes());
    } catch (err) { setError(err.message || "Échec du mode."); }
    finally { setEnvoi(false); }
  };

  // Définition des frais réservée au Fondateur (2) — et au Root (0) super-admin
  const estFondateur = user?.role === "admin" && [0, 2].includes(Number(user?.typeRole));
  const tabs = [
    { key: "versements", label: "Versements", icon: <Receipt size={16} /> },
    { key: "bilan", label: "Bilan par Classe", icon: <FileText size={16} /> },
    ...(estFondateur ? [{ key: "scolarite", label: "Scolarité & tranches", icon: <GraduationCap size={16} /> }] : []),
    { key: "modes", label: "Modes", icon: <Wallet size={16} /> },
  ];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <CreditCard size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Paiements</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return <button key={tb.key} onClick={() => setTab(tb.key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)", boxShadow: active ? "0 4px 12px rgba(216,99,16,0.25)" : "none" }}>{tb.icon}{tb.label}</button>;
        })}
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {/* ── BILAN PAR CLASSE ── */}
      {tab === "bilan" && <BilanClasse anneeId={idAca} />}

      {/* ── VERSEMENTS ── */}
      {tab === "versements" && (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
            <div style={{ minWidth: 260 }}>
              <label style={labelStyle}>Élève</label>
              <select style={inputStyle} value={matricule} onChange={(e) => setMatricule(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {eleves.map((el) => <option key={el.matricule} value={el.matricule}>{el.prenom} {el.nom} (#{el.matricule})</option>)}
              </select>
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={labelStyle}>Année</label>
              <select style={inputStyle} value={idAca} onChange={(e) => setIdAca(e.target.value)}>
                <option value="">— Année —</option>
                {annees.map((a) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
              </select>
            </div>
            {matricule && idAca && arrieres && (
              <div style={{ minWidth: 200, alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <label style={labelStyle}>Classe / Cycle</label>
                <div style={{ ...inputStyle, display: "flex", alignItems: "center", background: "rgba(216,99,16,0.06)", fontWeight: 600, color: "var(--text-dark)" }}>
                  {arrieres.classe?.libelle || "—"}{arrieres.cycle ? ` · ${arrieres.cycle.libelle}` : ""}
                </div>
              </div>
            )}
            {matricule && (
              <button onClick={() => { setVerForm({ montant: "", datePaie: "", idMode: "", idPers: user?.role === "personne" ? String(user.id) : "" }); setVerErreur(""); setVerModal(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white" }}>
                <Plus size={16} /> Enregistrer un versement
              </button>
            )}
          </div>

          {matricule && (
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              <Carte titre="Total versé" valeur={fmt(arrieres ? arrieres.totalPaye : total)} principal />
              <Carte titre="Total dû" valeur={arrieres ? fmt(arrieres.totalDu) : "—"} />
              <Carte titre="Reste à payer" valeur={arrieres ? fmt(arrieres.arriere) : "—"} accent={arrieres && arrieres.arriere > 0} />
            </div>
          )}
          {matricule && !idAca && (
            <p style={{ fontSize: 12, color: "#8a7060", marginBottom: 14 }}>ℹ️ Choisis une <b>année</b> pour afficher le total dû et le reste à payer (le cycle est déduit automatiquement de la classe de l'élève).</p>
          )}
          {matricule && idAca && arrieres && !arrieres.classe && (
            <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 14 }}>⚠️ L'élève n'est <b>affecté à aucune classe</b> pour cette année — impossible de déterminer les frais. Affecte-le à une salle/classe.</p>
          )}
          {matricule && idAca && arrieres && arrieres.classe && !arrieres.scolariteDefinie && (
            <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 14 }}>⚠️ Aucune scolarité définie pour le cycle <b>{arrieres.cycle?.libelle}</b>. Définis la scolarité (onglet « Scolarité &amp; tranches ») pour calculer le dû.</p>
          )}

          {/* Échéancier (tranches) */}
          {matricule && idAca && arrieres && arrieres.scolariteDefinie && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarClock size={16} style={{ color: "var(--orange)" }} /> Échéancier
              </h3>
              {(() => {
                const trs = Array.isArray(arrieres.tranches) ? arrieres.tranches : [];
                // Couverture : inscription d'abord, puis les tranches dans l'ordre.
                let cumul = Number(arrieres.inscription) || 0;
                const paye = Number(arrieres.totalPaye) || 0;
                const inscriptionOk = paye >= cumul;
                return (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <Echeance libelle="Inscription" montant={arrieres.inscription} couverte={inscriptionOk} echeance="à l'inscription" />
                      {trs.map((t) => {
                        cumul += Number(t.montant) || 0;
                        const couverte = paye >= cumul;
                        const ech = (t.delai_mois && t.delai_mois !== "00") || (t.delai_jour && t.delai_jour !== "00")
                          ? `${t.delai_jour && t.delai_jour !== "00" ? t.delai_jour + "/" : ""}${t.delai_mois && t.delai_mois !== "00" ? "mois " + t.delai_mois : ""}`.trim()
                          : "—";
                        return <Echeance key={t.idTranche} libelle={t.libelle} montant={t.montant} couverte={couverte} echeance={ech} />;
                      })}
                    </div>
                    {trs.length === 0 && (
                      <p style={{ fontSize: 12, color: "#8a7060", marginTop: 4 }}>Aucune tranche définie : seule l'inscription compose l'échéancier. Ajoute des tranches dans l'onglet « Scolarité &amp; tranches ».</p>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            {!matricule ? <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Sélectionnez un élève pour voir ses versements.</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th style={thStyle}>Date</th><th style={thStyle}>Montant</th><th style={thStyle}>Mode</th><th style={thStyle}>Commentaire</th><th style={{ ...thStyle, textAlign: "right" }}>Reçu</th></tr></thead>
                <tbody>
                  {paiements.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={5}>Aucun versement.</td></tr> :
                    paiements.map((p) => (
                      <tr key={p.idPaie}>
                        <td style={tdStyle}>{formatDate(p.datePaie)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{fmt(p.montant)}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.mode?.libelle || "—"}</td>
                        <td style={{ ...tdStyle, color: "var(--muted)" }}>{p.commentaire && p.commentaire !== "INDEFINI" ? p.commentaire : "—"}</td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <button onClick={() => {
                            const el = eleves.find((e) => String(e.matricule) === String(matricule));
                            const an = annees.find((a) => String(a.idAnnee) === String(idAca));
                            imprimerRecu({ eleve: el || { matricule }, paiement: p, classe: arrieres?.classe?.libelle, annee: an?.libelle });
                          }} title="Imprimer le reçu" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            <Printer size={13} /> Reçu
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── SCOLARITÉ ── */}
      {tab === "scolarite" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Cycle</th><th style={thStyle}>Inscription</th><th style={thStyle}>Pension</th><th style={thStyle}>Tranches</th></tr></thead>
              <tbody>
                {scolarites.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={4}>Aucune scolarité définie.</td></tr> :
                  scolarites.map((s) => (
                    <tr key={s.idScolarite}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{s.cycle?.libelle || "—"}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{fmt(s.inscription)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{fmt(s.pension)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{(s.tranches || []).length}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Définir une scolarité */}
            <form onSubmit={ajouterScolarite} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Définir une scolarité</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Cycle *</label>
                  <select style={inputStyle} value={fScol.idCycle} onChange={(e) => setFScol((s) => ({ ...s, idCycle: e.target.value }))}>
                    <option value="">— Choisir —</option>
                    {cycles.map((c) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={labelStyle}>Inscription *</label><input type="number" min="0" style={inputStyle} value={fScol.inscription} onChange={(e) => setFScol((s) => ({ ...s, inscription: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Pension *</label><input type="number" min="0" style={inputStyle} value={fScol.pension} onChange={(e) => setFScol((s) => ({ ...s, pension: e.target.value }))} /></div>
                </div>
                <div><label style={labelStyle}>Nombre de tranches</label><input type="number" min="1" style={inputStyle} value={fScol.nbreTranche} onChange={(e) => setFScol((s) => ({ ...s, nbreTranche: e.target.value }))} /></div>
                <BtnSubmit envoi={envoi} disabled={cycles.length === 0} hint={cycles.length === 0 ? "Crée d'abord un cycle." : ""} />
              </div>
            </form>

            {/* Ajouter une tranche */}
            <form onSubmit={ajouterTranche} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Ajouter une tranche</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Scolarité *</label>
                  <select style={inputStyle} value={fTranche.idScolarite} onChange={(e) => setFTranche((s) => ({ ...s, idScolarite: e.target.value }))}>
                    <option value="">— Choisir —</option>
                    {scolarites.map((s) => <option key={s.idScolarite} value={s.idScolarite}>{s.cycle?.libelle} ({fmt(s.inscription + s.pension)})</option>)}
                  </select>
                </div>
                <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fTranche.libelle} onChange={(e) => setFTranche((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : 1ère tranche" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div><label style={labelStyle}>Montant *</label><input type="number" min="0" style={inputStyle} value={fTranche.montant} onChange={(e) => setFTranche((s) => ({ ...s, montant: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Mois</label><input maxLength={2} style={inputStyle} value={fTranche.delai_mois} onChange={(e) => setFTranche((s) => ({ ...s, delai_mois: e.target.value }))} placeholder="10" /></div>
                  <div><label style={labelStyle}>Jour</label><input maxLength={2} style={inputStyle} value={fTranche.delai_jour} onChange={(e) => setFTranche((s) => ({ ...s, delai_jour: e.target.value }))} placeholder="15" /></div>
                </div>
                <BtnSubmit envoi={envoi} disabled={scolarites.length === 0} hint={scolarites.length === 0 ? "Définis d'abord une scolarité." : ""} />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODES ── */}
      {tab === "modes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Mode</th><th style={thStyle}>Information</th></tr></thead>
              <tbody>
                {modes.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={2}>Aucun mode.</td></tr> :
                  modes.map((m) => (
                    <tr key={m.idMode}><td style={{ ...tdStyle, fontWeight: 600 }}>{m.libelle}</td><td style={{ ...tdStyle, color: "var(--muted)" }}>{m.information && m.information !== "INDEFINI" ? m.information : "—"}</td></tr>
                  ))}
              </tbody>
            </table>
          </div>
          <form onSubmit={ajouterMode} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Plus size={18} style={{ color: "var(--orange)" }} /> Nouveau mode</h3>
            <div style={{ marginBottom: 14 }}><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={nouveauMode.libelle} onChange={(e) => setNouveauMode((s) => ({ ...s, libelle: e.target.value }))} placeholder="ex : Espèces, Mobile Money…" /></div>
            <div style={{ marginBottom: 18 }}><label style={labelStyle}>Information</label><input style={inputStyle} value={nouveauMode.information} onChange={(e) => setNouveauMode((s) => ({ ...s, information: e.target.value }))} placeholder="Optionnel" /></div>
            <BtnSubmit envoi={envoi} />
          </form>
        </div>
      )}

      {/* ── Modal versement ── */}
      {verModal && (
        <div onClick={() => !envoi && setVerModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)" }}>Enregistrer un versement</h2>
              <button onClick={() => !envoi && setVerModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}><X size={20} /></button>
            </div>
            <form onSubmit={soumettreVersement} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Montant *</label><input type="number" min="0" style={inputStyle} value={verForm.montant} onChange={(e) => setVerForm((s) => ({ ...s, montant: e.target.value }))} /></div>
                <div><label style={labelStyle}>Date *</label><input type="date" style={inputStyle} value={verForm.datePaie} onChange={(e) => setVerForm((s) => ({ ...s, datePaie: e.target.value }))} /></div>
              </div>
              <div>
                <label style={labelStyle}>Mode *</label>
                <select style={inputStyle} value={verForm.idMode} onChange={(e) => setVerForm((s) => ({ ...s, idMode: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {modes.map((m) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Enregistré par *</label>
                <select style={inputStyle} value={verForm.idPers} onChange={(e) => setVerForm((s) => ({ ...s, idPers: e.target.value }))}>
                  <option value="">— Choisir une personne —</option>
                  {personnes.map((p) => <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              {(modes.length === 0 || !idAca) && (
                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(216,99,16,0.08)", border: "1px solid rgba(216,99,16,0.2)", color: "#ac3b02", fontSize: 13 }}>
                  Il faut une <b>année</b> sélectionnée et au moins un <b>mode</b> de paiement.
                </div>
              )}
              {verErreur && <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13 }}>{verErreur}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button type="button" onClick={() => setVerModal(false)} disabled={envoi} style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: envoi ? "rgba(216,99,16,0.6)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Carte({ titre, valeur, principal, accent }) {
  return (
    <div style={{
      borderRadius: 16, padding: "18px 24px", minWidth: 180,
      background: principal ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)",
      border: principal ? "none" : "1px solid var(--surface-border)",
      color: principal ? "white" : "var(--text-dark)",
    }}>
      <div style={{ fontSize: 13, opacity: principal ? 0.85 : 1, color: principal ? "white" : "var(--muted)" }}>{titre}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: accent ? "#ef4444" : (principal ? "white" : "var(--text-dark)") }}>{valeur}</div>
    </div>
  );
}

function Echeance({ libelle, montant, couverte, echeance }) {
  return (
    <div style={{
      borderRadius: 12, padding: "10px 14px", minWidth: 130,
      background: couverte ? "rgba(34,197,94,0.08)" : "rgba(26,18,8,0.03)",
      border: couverte ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--surface-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--text-dark)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: couverte ? "#22c55e" : "#cbb9ab", display: "inline-block" }} />
        {libelle}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-dark)", marginTop: 2 }}>{(Number(montant) || 0).toLocaleString("fr-FR")} FCFA</div>
      <div style={{ fontSize: 10.5, color: couverte ? "#16a34a" : "#8a7060", marginTop: 2 }}>{couverte ? "✓ réglée" : `échéance : ${echeance}`}</div>
    </div>
  );
}

function BtnSubmit({ envoi, disabled, hint }) {
  return (
    <div>
      <button type="submit" disabled={envoi || disabled} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: (envoi || disabled) ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: (envoi || disabled) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "…" : "Ajouter"}</button>
      {hint && <p style={{ fontSize: 11, color: "#8a7060", marginTop: 6 }}>{hint}</p>}
    </div>
  );
}
