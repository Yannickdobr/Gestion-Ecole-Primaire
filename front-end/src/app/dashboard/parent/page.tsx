"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getElevesByParent, 
  getNotesEleve, 
  getPaiementsEleve, 
  getMesMessages,
  getArrieresAuto,
  getFrequenteByEleve,
  getEmploiParClasse,
  getRapportsEleve,
  createJustificatif,
  getJustificatifsByRapport,
  getAnnees,
  getTrimestres,
  getBulletinTrimestriel,
  uploadFichier,
  fichierURL
} from "@/lib/api";
import { imprimerRecu, imprimerBulletin, imprimerBulletinTrimestriel } from "@/lib/print";
import ChangePassword from "@/components/ChangePassword";
import { 
  LogOut, GraduationCap, BookOpen, Wallet, Mail, Printer, 
  Calendar, ShieldAlert, FileCheck, UploadCloud, CheckCircle, 
  AlertTriangle, Clock, User 
} from "lucide-react";

function formatMontant(m: any) {
  const n = Number(m) || 0;
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();

  const [enfants, setEnfants] = useState<any[]>([]);
  const [selection, setSelection] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("notes");
  const [annees, setAnnees] = useState<any[]>([]);
  const [activeYearId, setActiveYearId] = useState<number | null>(null);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [selectedTrimes, setSelectedTrimes] = useState<number | "">("");

  const [arrieresData, setArrieresData] = useState<any>(null);
  const [frequence, setFrequence] = useState<any>(null);
  const [emploi, setEmploi] = useState<any[]>([]);
  const [rapports, setRapports] = useState<any[]>([]);
  const [justifs, setJustifs] = useState<{ [idRap: number]: any }>({});

  // Justification modal/form states
  const [justifyingRapId, setJustifyingRapId] = useState<number | null>(null);
  const [justifComment, setJustifComment] = useState("");
  const [justifFile, setJustifFile] = useState<File | null>(null);
  const [uploadingJustif, setUploadingJustif] = useState(false);

  // Charger les années académiques et les trimestres au montage
  useEffect(() => {
    (async () => {
      try {
        const [list, trims] = await Promise.all([getAnnees(), getTrimestres().catch(() => [])]);
        if (Array.isArray(list) && list.length > 0) {
          setAnnees(list);
          // Sélectionner l'année académique la plus récente
          const sorted = [...list].sort((a, b) => b.idAnnee - a.idAnnee);
          setActiveYearId(sorted[0].idAnnee);
        }
        setTrimestres(Array.isArray(trims) ? trims : []);
      } catch (err) {
        console.error("Erreur lors de la récupération des années académiques", err);
      }
    })();
  }, []);

  // Charger les enfants du parent connecté (user.id = idPers)
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [data, msgs] = await Promise.all([
          getElevesByParent(user.id),
          getMesMessages().catch(() => []),
        ]);
        const liste = Array.isArray(data) ? data : [];
        setEnfants(liste);
        setMessages(Array.isArray(msgs) ? msgs : []);
        if (liste.length > 0) selectionner(liste[0]);
      } catch (e: any) {
        setError(e.message || "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeYearId]);

  const selectionner = async (enfant: any, yearId?: number) => {
    setSelection(enfant);
    setLoadingDetail(true);
    const targetYearId = yearId || activeYearId;
    try {
      // 1. Récupérer les notes, versements, affectations et rapports en parallèle
      const [n, p, f, r] = await Promise.all([
        getNotesEleve(enfant.matricule).catch(() => []),
        getPaiementsEleve(enfant.matricule).catch(() => []),
        getFrequenteByEleve(enfant.matricule).catch(() => null),
        getRapportsEleve(enfant.matricule).catch(() => []),
      ]);

      setNotes(Array.isArray(n) ? n : []);
      setPaiements(Array.isArray(p) ? p : []);
      setRapports(Array.isArray(r) ? r : []);

      // 2. Traiter l'affectation de l'élève (Classe & Salle)
      let activeFreq = null;
      if (f) {
        const list = Array.isArray(f) ? f : [f];
        activeFreq = targetYearId 
          ? list.find((item: any) => item.anneeAcademique?.idAnnee === targetYearId)
          : list[0];
        setFrequence(activeFreq);
      } else {
        setFrequence(null);
      }

      // 3. Charger l'emploi du temps si l'élève est dans une classe
      if (activeFreq?.salle?.classe?.idClasse) {
        const emp = await getEmploiParClasse(activeFreq.salle.classe.idClasse).catch(() => []);
        setEmploi(Array.isArray(emp) ? emp : []);
      } else {
        setEmploi([]);
      }

      // 4. Charger les arriérés / scolarité (solde restant à payer)
      if (targetYearId) {
        const arr = await getArrieresAuto(enfant.matricule, targetYearId).catch(() => null);
        setArrieresData(arr);
      } else {
        setArrieresData(null);
      }

      // 5. Charger les justificatifs pour chaque rapport
      const rList = Array.isArray(r) ? r : [];
      const justMap: { [id: number]: any } = {};
      await Promise.all(
        rList.map(async (rap: any) => {
          try {
            const j = await getJustificatifsByRapport(rap.idRap);
            if (j && (Array.isArray(j) ? j.length > 0 : true)) {
              justMap[rap.idRap] = Array.isArray(j) ? j[0] : j;
            }
          } catch {}
        })
      );
      setJustifs(justMap);

    } catch (e: any) {
      console.error(e);
      setNotes([]);
      setPaiements([]);
      setFrequence(null);
      setEmploi([]);
      setArrieresData(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleJustifSubmit = async (rapId: number) => {
    if (!justifComment.trim()) {
      alert("Veuillez saisir un motif ou un commentaire pour justifier l'absence.");
      return;
    }

    setUploadingJustif(true);
    try {
      let fileUrl = "";
      if (justifFile) {
        const uploadRes = await uploadFichier(justifFile);
        fileUrl = uploadRes?.url || "";
      }

      const payload = {
        idRapport: rapId,
        commentaire: justifComment,
        urlDoc: fileUrl || "SANS_DOCUMENT"
      };

      const created = await createJustificatif(payload);

      // Mettre à jour l'état local des justificatifs
      setJustifs(prev => ({ ...prev, [rapId]: created }));
      setJustifyingRapId(null);
      setJustifComment("");
      setJustifFile(null);
      alert("Votre justificatif a été enregistré avec succès et sera étudié par la direction.");
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'enregistrement du justificatif.");
    } finally {
      setUploadingJustif(false);
    }
  };

  const totalPaye = paiements.reduce((acc, p) => acc + (Number(p.montant) || 0), 0);

  // Trimestres de l'année sélectionnée (pour le bulletin trimestriel)
  const trimestresAnnee = activeYearId
    ? trimestres.filter((t) => Number(t.anneeAcademique?.idAnnee) === Number(activeYearId))
    : trimestres;

  const telechargerBulletinTrimestriel = async () => {
    if (!selection || !selectedTrimes) return;
    try {
      const b = await getBulletinTrimestriel(selection.matricule, Number(selectedTrimes));
      imprimerBulletinTrimestriel(b);
    } catch (e: any) {
      alert(e.message || "Impossible de générer le bulletin trimestriel.");
    }
  };

  const renderTranchesList = () => {
    if (!arrieresData || !arrieresData.tranches || arrieresData.tranches.length === 0) {
      return <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Aucune tranche de paiement n'est définie pour ce cycle.</div>;
    }

    let totalPaidLeft = totalPaye;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {arrieresData.tranches.map((t: any, i: number) => {
          const amount = Number(t.montant) || 0;
          let status = "unpaid"; // 'paid' | 'partial' | 'unpaid'
          let paidAmount = 0;

          if (totalPaidLeft >= amount) {
            status = "paid";
            paidAmount = amount;
            totalPaidLeft -= amount;
          } else if (totalPaidLeft > 0) {
            status = "partial";
            paidAmount = totalPaidLeft;
            totalPaidLeft = 0;
          }

          return (
            <div key={t.idTranche || i} style={{ padding: 16, borderRadius: 12, background: "#faf9f7", border: "1px solid var(--surface-border, #eee)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark)" }}>{t.libelle}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Date limite : {t.delai_jour}/{t.delai_mois}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--orange)" }}>{formatMontant(amount)}</div>
                <div style={{ marginTop: 4 }}>
                  {status === "paid" && <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: 12 }}>Payé</span>}
                  {status === "partial" && <span style={{ fontSize: 11, fontWeight: 700, color: "#ca8a04", background: "#fef9c3", padding: "2px 8px", borderRadius: 12 }}>Partiel ({formatMontant(paidAmount)})</span>}
                  {status === "unpaid" && <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fee2e2", padding: "2px 8px", borderRadius: 12 }}>Non payé</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream, #f5f0ea)", fontFamily: "var(--font-body)" }}>
      {/* En-tête */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          background: "var(--surface, #fff)",
          borderBottom: "1px solid var(--surface-border, #eee)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/star.png" alt="BrightSchool" style={{ width: 28, height: 28 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--orange)", fontFamily: "var(--font-display)" }}>
            BrightSchool — Espace Parent
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "var(--text-dark)", fontWeight: 600 }}>
            {user?.nom || user?.username}
          </span>
          <button
            onClick={logout}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--surface-border, #eee)", background: "var(--surface, #fff)", color: "#4a3728", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 24 }}>
          Mes enfants
        </h1>

        {error && (
          <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
        ) : enfants.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)", background: "var(--surface, #fff)", borderRadius: 20, border: "1px solid var(--surface-border, #eee)" }}>
            Aucun enfant n'est rattaché à votre compte.
          </div>
        ) : (
          <>
            {/* Barre de sélection et année académique */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {enfants.map((enf) => {
                  const actif = selection?.matricule === enf.matricule;
                  return (
                    <button
                      key={enf.matricule}
                      onClick={() => selectionner(enf)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 18px",
                        borderRadius: 16,
                        border: actif ? "2px solid var(--orange)" : "1px solid var(--surface-border, #eee)",
                        background: "var(--surface, #fff)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: actif ? "0 4px 16px rgba(216,99,16,0.18)" : "none",
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {`${(enf.prenom?.[0] || "")}${(enf.nom?.[0] || "")}`.toUpperCase()}
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>{enf.prenom} {enf.nom}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Matricule #{enf.matricule}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {annees.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface, #fff)", padding: "8px 16px", borderRadius: 12, border: "1px solid var(--surface-border, #eee)" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dark)" }}>Année académique :</span>
                  <select
                    value={activeYearId || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setActiveYearId(val);
                      if (selection) selectionner(selection, val);
                    }}
                    style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, fontWeight: 700, color: "var(--orange)", cursor: "pointer" }}
                  >
                    {annees.map((y) => (
                      <option key={y.idAnnee} value={y.idAnnee}>{y.libelle}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Détail de l'enfant sélectionné */}
            {selection && (
              <div>
                {/* Carte profil rapide de l'enfant */}
                <div style={{ background: "var(--surface, #fff)", padding: "16px 24px", borderRadius: 16, border: "1px solid var(--surface-border, #eee)", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "rgba(216,99,16,0.1)", color: "var(--orange)", width: 42, height: 42, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Classe & Salle</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>
                        {frequence ? `${frequence.salle?.libelle} (${frequence.salle?.classe?.libelle || "—"})` : "Non affecté cette année"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Date de Naissance</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>
                        {selection.dateNais ? new Date(selection.dateNais).toLocaleDateString("fr-FR") : "Non renseigné"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Sexe</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>
                        {selection.sexe === "M" ? "Masculin" : selection.sexe === "F" ? "Féminin" : selection.sexe || "Non renseigné"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Onglets interactifs */}
                <div style={{ display: "flex", borderBottom: "2px solid var(--surface-border, #eee)", marginBottom: 24, gap: 16, overflowX: "auto" }}>
                  {[
                    { id: "notes", label: "Notes & Évaluations", icon: BookOpen },
                    { id: "finances", label: "Scolarité & Solde", icon: Wallet },
                    { id: "emploi", label: "Emploi du temps", icon: Calendar },
                    { id: "discipline", label: "Assiduité & Discipline", icon: ShieldAlert },
                  ].map((tab) => {
                    const actif = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "12px 16px",
                          border: "none",
                          borderBottom: actif ? "3px solid var(--orange)" : "3px solid transparent",
                          background: "none",
                          color: actif ? "var(--orange)" : "var(--muted)",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <tab.icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {loadingDetail ? (
                  <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Chargement des informations…</div>
                ) : (
                  <div>
                    {/* TAB: NOTES */}
                    {activeTab === "notes" && (
                      <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, overflow: "hidden" }}>
                        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--surface-border, #eee)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BookOpen size={18} style={{ color: "var(--orange)" }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Notes de {selection.prenom}</h3>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <select
                              value={selectedTrimes}
                              onChange={(e) => setSelectedTrimes(e.target.value ? Number(e.target.value) : "")}
                              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", fontSize: 13, fontFamily: "inherit", color: "var(--text-dark)", cursor: "pointer" }}
                            >
                              <option value="">— Trimestre —</option>
                              {trimestresAnnee.map((t) => (
                                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
                              ))}
                            </select>
                            <button
                              onClick={telechargerBulletinTrimestriel}
                              disabled={!selectedTrimes}
                              title={!selectedTrimes ? "Choisissez un trimestre" : "Télécharger le bulletin trimestriel"}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: !selectedTrimes ? "rgba(216,99,16,0.4)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 13, fontWeight: 600, cursor: !selectedTrimes ? "default" : "pointer", fontFamily: "inherit" }}
                            >
                              <Printer size={15} /> Bulletin trimestriel
                            </button>
                            <button
                              onClick={() => {
                                const coefs = notes.reduce((s, n) => s + (Number(n.cours?.coefficient) || 1), 0);
                                const moyenne = coefs
                                  ? notes.reduce((s, n) => s + (Number(n.note) || 0) * (Number(n.cours?.coefficient) || 1), 0) / coefs
                                  : null;
                                imprimerBulletin({ eleve: selection, session: "Relevé de notes", notes, moyenne });
                              }}
                              disabled={notes.length === 0}
                              title={notes.length === 0 ? "Aucune note à imprimer" : "Télécharger le relevé"}
                              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--orange)", fontSize: 13, fontWeight: 600, cursor: notes.length === 0 ? "default" : "pointer", fontFamily: "inherit", opacity: notes.length === 0 ? 0.5 : 1 }}
                            >
                              <Printer size={15} /> Relevé
                            </button>
                          </div>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              <th style={{ padding: "12px 24px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border, #eee)" }}>Cours</th>
                              <th style={{ padding: "12px 24px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border, #eee)" }}>Note</th>
                              <th style={{ padding: "12px 24px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border, #eee)" }}>Appréciation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notes.length === 0 ? (
                              <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Aucune note disponible.</td></tr>
                            ) : (
                              notes.map((n, i) => (
                                <tr key={n.idEval ?? i}>
                                  <td style={{ padding: "12px 24px", fontSize: 14, borderBottom: "1px solid var(--surface-border, #eee)" }}>{n.cours?.libelle || "—"}</td>
                                  <td style={{ padding: "12px 24px", fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--surface-border, #eee)" }}>{n.note}/20</td>
                                  <td style={{ padding: "12px 24px", fontSize: 14, color: "var(--muted)", borderBottom: "1px solid var(--surface-border, #eee)" }}>{n.appreciation || "—"}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* TAB: SCOLARITE / FINANCES */}
                    {activeTab === "finances" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
                        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, padding: 24 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <Wallet size={18} style={{ color: "var(--orange)" }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Scolarité de {selection.prenom}</h3>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                            <div style={{ background: "#faf9f7", padding: 16, borderRadius: 12, border: "1px solid #f1eeea" }}>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>Scolarité Totale Due</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginTop: 4 }}>
                                {arrieresData?.scolariteDefinie ? formatMontant(arrieresData.totalDu) : "—"}
                              </div>
                            </div>
                            <div style={{ background: "rgba(22,163,74,0.05)", padding: 16, borderRadius: 12, border: "1px solid rgba(22,163,74,0.1)" }}>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>Déjà Versé</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a", fontFamily: "var(--font-display)", marginTop: 4 }}>
                                {formatMontant(totalPaye)}
                              </div>
                            </div>
                          </div>

                          {arrieresData?.scolariteDefinie && (
                            <div style={{ background: arrieresData.arriere > 0 ? "rgba(216,99,16,0.06)" : "rgba(22,163,74,0.06)", padding: "18px 20px", borderRadius: 16, border: arrieresData.arriere > 0 ? "1px solid rgba(216,99,16,0.15)" : "1px solid rgba(22,163,74,0.15)", marginBottom: 24 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Reste à payer (Solde)</div>
                                  <div style={{ fontSize: 24, fontWeight: 800, color: arrieresData.arriere > 0 ? "var(--orange)" : "#16a34a", fontFamily: "var(--font-display)", marginTop: 4 }}>
                                    {formatMontant(arrieresData.arriere)}
                                  </div>
                                </div>
                                <div>
                                  {arrieresData.arriere > 0 ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--orange)", fontSize: 13, fontWeight: 700 }}>
                                      <AlertTriangle size={16} /> En attente
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a", fontSize: 13, fontWeight: 700 }}>
                                      <CheckCircle size={16} /> En règle
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Historique des versements</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {paiements.length === 0 ? (
                              <div style={{ padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Aucun versement enregistré.</div>
                            ) : (
                              paiements.map((p, i) => (
                                <div key={p.idPaie ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#faf9f7", border: "1px solid var(--surface-border, #eee)" }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)" }}>{formatMontant(p.montant)}</div>
                                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{p.datePaie ? new Date(p.datePaie).toLocaleDateString("fr-FR") : "—"}{p.mode?.libelle ? ` · ${p.mode.libelle}` : ""}</div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const mappedAnnee = activeYearId ? annees.find(y => y.idAnnee === activeYearId) : null;
                                      imprimerRecu({ 
                                        eleve: selection, 
                                        paiement: p, 
                                        classe: frequence?.salle?.classe?.libelle || frequence?.salle?.libelle || "—", 
                                        annee: mappedAnnee?.libelle || "—" 
                                      });
                                    }}
                                    title="Imprimer le reçu"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, border: "1px solid var(--surface-border, #eee)", background: "var(--surface, #fff)", color: "var(--orange)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                                  >
                                    <Printer size={13} /> Reçu
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Échéancier */}
                        <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, padding: 24 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <Clock size={18} style={{ color: "var(--orange)" }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Échéancier des Tranches</h3>
                          </div>
                          {renderTranchesList()}
                        </div>
                      </div>
                    )}

                    {/* TAB: EMPLOI DU TEMPS */}
                    {activeTab === "emploi" && (
                      <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                          <Calendar size={18} style={{ color: "var(--orange)" }} />
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Emploi du temps de {selection.prenom}</h3>
                        </div>

                        {emploi.length === 0 ? (
                          <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Aucun cours n'est configuré dans l'emploi du temps pour cette classe.</div>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((jour) => {
                              const courses = emploi.filter((e) => e.jour.toLowerCase() === jour.toLowerCase()).sort((a, b) => a.heure.localeCompare(b.heure));
                              return (
                                <div key={jour} style={{ background: "#faf9f7", borderRadius: 16, border: "1px solid var(--surface-border, #eee)", padding: 16 }}>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--orange)", borderBottom: "2px solid #f1eeea", paddingBottom: 8, marginBottom: 12, textAlign: "center" }}>{jour}</div>
                                  {courses.length === 0 ? (
                                    <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, padding: "12px 0" }}>Aucun cours</div>
                                  ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                      {courses.map((c, idx) => (
                                        <div key={c.idTemps ?? idx} style={{ background: "white", padding: 10, borderRadius: 10, border: "1px solid #f1eeea", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                            <Clock size={10} /> {c.heure}
                                          </div>
                                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)", marginTop: 4 }}>{c.cours?.libelle || "Matière"}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: ASSIDUITE & DISCIPLINE */}
                    {activeTab === "discipline" && (
                      <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, padding: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                          <ShieldAlert size={18} style={{ color: "var(--orange)" }} />
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Suivi d'assiduité & incidents</h3>
                        </div>

                        {rapports.length === 0 ? (
                          <div style={{ padding: 32, textAlign: "center", color: "#16a34a", fontSize: 14, fontWeight: 600 }}>
                            🎉 Aucun incident ni absence signalés. Félicitations pour le bon comportement et l'assiduité !
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {rapports.map((r, i) => {
                              const customJustif = justifs[r.idRap];
                              const isAbsence = r.libelle.toLowerCase().includes("absence") || r.libelle.toLowerCase().includes("retard");
                              
                              return (
                                <div key={r.idRap ?? i} style={{ border: "1px solid var(--surface-border, #eee)", borderRadius: 16, padding: 20, background: "#faf9f7" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                                    <div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark)" }}>{r.libelle}</span>
                                        {r.points > 0 && (
                                          <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", background: "#fee2e2", padding: "2px 8px", borderRadius: 12 }}>
                                            -{r.points} points
                                          </span>
                                        )}
                                      </div>
                                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                                        Signalé le : {new Date(r.event_date).toLocaleDateString("fr-FR")}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      {customJustif ? (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: 12 }}>
                                          <CheckCircle size={12} /> {customJustif.idDirecteur ? "Justifié (Validé)" : "Justifié (En attente)"}
                                        </span>
                                      ) : isAbsence ? (
                                        <button
                                          onClick={() => setJustifyingRapId(justifyingRapId === r.idRap ? null : r.idRap)}
                                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--orange)", background: "transparent", color: "var(--orange)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                                        >
                                          Justifier l'absence
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>

                                  <div style={{ fontSize: 14, color: "#4a3728", fontStyle: "italic", background: "white", padding: 12, borderRadius: 10, border: "1px solid #f1eeea" }}>
                                    "{r.commentaire || "Aucune observation."}"
                                  </div>

                                  {/* Justificatif existant */}
                                  {customJustif && (
                                    <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(22,163,74,0.03)", border: "1px solid rgba(22,163,74,0.1)", fontSize: 13 }}>
                                      <div style={{ fontWeight: 700, color: "#16a34a" }}>Votre Justification :</div>
                                      <div style={{ color: "var(--text-dark)", marginTop: 4 }}>"{customJustif.commentaire}"</div>
                                      {customJustif.urlDoc && customJustif.urlDoc !== "SANS_DOCUMENT" && (
                                        <a
                                          href={fichierURL(customJustif.urlDoc)}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--orange)", fontWeight: 600, textDecoration: "underline", marginTop: 8 }}
                                        >
                                          Voir la pièce jointe
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* Formulaire de saisie d'un justificatif */}
                                  {justifyingRapId === r.idRap && (
                                    <div style={{ marginTop: 16, padding: 16, background: "white", borderRadius: 12, border: "1px solid var(--surface-border, #eee)" }}>
                                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-dark)", marginBottom: 12 }}>Déposer un justificatif d'absence</h4>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        <div>
                                          <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Motif / Explication :</label>
                                          <textarea
                                            value={justifComment}
                                            onChange={(e) => setJustifComment(e.target.value)}
                                            placeholder="Ex: Mon enfant était malade (certificat ci-joint)."
                                            rows={2}
                                            style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8, outline: "none", fontFamily: "inherit", fontSize: 13 }}
                                          />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Pièce jointe (facultatif) :</label>
                                          <input
                                            type="file"
                                            onChange={(e) => setJustifFile(e.target.files?.[0] || null)}
                                            style={{ fontSize: 12 }}
                                          />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                                          <button
                                            onClick={() => setJustifyingRapId(null)}
                                            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12 }}
                                          >
                                            Annuler
                                          </button>
                                          <button
                                            onClick={() => handleJustifSubmit(r.idRap)}
                                            disabled={uploadingJustif}
                                            style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--orange)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                                          >
                                            {uploadingJustif ? "Envoi..." : "Envoyer"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Messages reçus de l'école */}
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Mail size={20} style={{ color: "var(--orange)" }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Messages de l'école</h2>
            {messages.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{messages.length}</span>
            )}
          </div>
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, overflow: "hidden" }}>
            {messages.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Aucun message reçu pour le moment.</div>
            ) : (
              messages.map((m, i) => (
                <div key={m.idMessages ?? i} style={{ padding: "18px 24px", borderBottom: "1px solid var(--surface-border, #eee)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>{m.objet}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      de <b>{m.expediteur?.prenom} {m.expediteur?.nom}</b> · {new Date(m.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: "#4a3728", whiteSpace: "pre-wrap" }}>{m.information}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Changer mon mot de passe */}
        <div style={{ marginTop: 40 }}>
          <ChangePassword />
        </div>
      </main>
    </div>
  );
}
