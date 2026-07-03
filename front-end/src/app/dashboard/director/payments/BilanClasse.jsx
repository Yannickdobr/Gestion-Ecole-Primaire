"use client";

import { useState, useEffect } from "react";
import { getClasses, getFrequenteBySalle, getArrieresAuto } from "@/lib/api";
import { Search, Printer, DollarSign } from "lucide-react";

const thStyle = { padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 20px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

const fmt = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";

export default function BilanClasse({ anneeId }) {
  const [classes, setClasses] = useState([]);
  const [idClasse, setIdClasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [elevesBilan, setElevesBilan] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getClasses().then(setClasses).catch(() => {});
  }, []);

  const chargerBilan = async () => {
    if (!idClasse || !anneeId) return;
    setLoading(true);
    setError("");
    setElevesBilan([]);
    
    try {
      // Pour une classe, on doit récupérer les salles associées pour avoir les élèves (frequente)
      // La requête getFrequenteBySalle(idSalle) est dispo. 
      // Mais on n'a que idClasse dans le select.
      // Le backend getClasses renvoie les classes avec leurs salles (`salles`).
      const classeObj = classes.find(c => String(c.idClasse) === String(idClasse));
      if (!classeObj || !classeObj.salles || classeObj.salles.length === 0) {
        throw new Error("Cette classe n'a aucune salle associée.");
      }

      // Pour simplifier, on prend la première salle (ou on boucle sur toutes les salles de la classe)
      let allFrequentes = [];
      for (const s of classeObj.salles) {
        const freq = await getFrequenteBySalle(s.idSalle).catch(() => []);
        allFrequentes = [...allFrequentes, ...freq];
      }

      // On filtre pour ne garder que l'année en cours
      const freqCurrentYear = allFrequentes.filter(f => String(f.anneeAcademique?.idAnnee) === String(anneeId));

      if (freqCurrentYear.length === 0) {
        throw new Error("Aucun élève inscrit dans cette classe pour l'année sélectionnée.");
      }

      // Pour chaque élève, on calcule ses arriérés
      const bilan = await Promise.all(
        freqCurrentYear.map(async (f) => {
          try {
            const arriere = await getArrieresAuto(f.eleve.matricule, anneeId);
            return {
              ...f.eleve,
              arriereInfo: arriere
            };
          } catch (e) {
            return { ...f.eleve, arriereInfo: null, error: true };
          }
        })
      );

      // Trier par nom
      bilan.sort((a, b) => a.nom.localeCompare(b.nom));
      setElevesBilan(bilan);

    } catch (err) {
      setError(err.message || "Erreur lors du calcul du bilan.");
    } finally {
      setLoading(false);
    }
  };

  const totalAttendu = elevesBilan.reduce((acc, el) => acc + (el.arriereInfo?.totalDu || 0), 0);
  const totalPaye = elevesBilan.reduce((acc, el) => acc + (el.arriereInfo?.totalPaye || 0), 0);
  const totalReste = elevesBilan.reduce((acc, el) => acc + (el.arriereInfo?.arriere || 0), 0);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 24, padding: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 24 }}>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <label style={labelStyle}>Sélectionnez une classe</label>
          <select style={{ ...inputStyle, width: "100%" }} value={idClasse} onChange={(e) => setIdClasse(e.target.value)}>
            <option value="">— Classe —</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={chargerBilan}
          disabled={!idClasse || !anneeId || loading}
          style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: "var(--orange)", color: "white", fontWeight: 600, cursor: loading || !idClasse ? "not-allowed" : "pointer" }}
        >
          {loading ? "Calcul en cours..." : "Générer le Bilan"}
        </button>
        {elevesBilan.length > 0 && (
          <button 
            onClick={() => window.print()}
            style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid var(--surface-border)", background: "transparent", color: "var(--text-dark)", fontWeight: 600, cursor: "pointer", display: "inline-flex", gap: 8, alignItems: "center", marginLeft: "auto" }}
          >
            <Printer size={16} /> Imprimer
          </button>
        )}
      </div>

      {error && <div style={{ color: "#ef4444", background: "#fef2f2", padding: 12, borderRadius: 12, marginBottom: 16, fontSize: 14 }}>{error}</div>}

      {elevesBilan.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, padding: 20, borderRadius: 16, background: "rgba(138,112,96,0.05)", border: "1px solid rgba(138,112,96,0.1)" }}>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>Total Attendu</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-dark)" }}>{fmt(totalAttendu)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200, padding: 20, borderRadius: 16, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div style={{ fontSize: 13, color: "#166534", fontWeight: 600, marginBottom: 4 }}>Total Encaissé</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#15803d" }}>{fmt(totalPaye)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 200, padding: 20, borderRadius: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize: 13, color: "#991b1b", fontWeight: 600, marginBottom: 4 }}>Reste à Recouvrer</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#b91c1c" }}>{fmt(totalReste)}</div>
            </div>
          </div>

          <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--surface-border)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Matricule</th>
                  <th style={thStyle}>Nom & Prénom</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Scolarité</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Payé</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Reste à Payer</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {elevesBilan.map((el) => {
                  const ar = el.arriereInfo;
                  const reste = ar?.arriere || 0;
                  const scolariteNonDef = ar && !ar.scolariteDefinie;
                  
                  return (
                    <tr key={el.matricule}>
                      <td style={tdStyle}>#{el.matricule}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{el.nom} {el.prenom}</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {scolariteNonDef ? <span style={{ color: "var(--muted)" }}>Non déf.</span> : fmt(ar?.totalDu)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", color: "#15803d", fontWeight: 500 }}>
                        {fmt(ar?.totalPaye)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right", color: reste > 0 ? "#dc2626" : "var(--text-dark)", fontWeight: 700 }}>
                        {scolariteNonDef ? "—" : fmt(reste)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {scolariteNonDef ? (
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, background: "#f3f4f6", color: "#4b5563", fontWeight: 600 }}>Inconnu</span>
                        ) : reste <= 0 ? (
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, background: "#dcfce7", color: "#166534", fontWeight: 600 }}>En Règle</span>
                        ) : (
                          <span style={{ fontSize: 12, padding: "4px 8px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>Insolvable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
