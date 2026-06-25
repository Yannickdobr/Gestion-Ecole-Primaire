"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getEnseignants, getEmploi } from "@/lib/api";
import { CalendarDays } from "lucide-react";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["08:00", "09:30", "11:15", "14:00", "15:30"];

// Normalise "08h00" / "8:0" → "08:00"
function normHeure(h = "") {
  const [hh = "0", mm = "0"] = String(h).replace("h", ":").split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}

export default function TeacherSchedule() {
  const { user } = useAuth();
  const [enseignant, setEnseignant] = useState(null);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [ens, emp] = await Promise.all([getEnseignants(), getEmploi()]);
        if (!actif) return;
        const mien = (Array.isArray(ens) ? ens : []).find(
          (e) => Number(e.personne?.idPers) === Number(user?.id),
        );
        setEnseignant(mien || null);
        if (mien?.classe?.idClasse) {
          const list = (Array.isArray(emp) ? emp : []).filter(
            (c) => Number(c.classe?.idClasse) === Number(mien.classe.idClasse),
          );
          setCreneaux(list);
        }
      } catch (e) {
        if (actif) setError(e.message || "Erreur de chargement.");
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => { actif = false; };
  }, [user?.id]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;

  if (!enseignant) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", marginBottom: 16 }}>Mon emploi du temps</h1>
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--surface-border)" }}>
          Vous n'êtes rattaché à aucune classe pour le moment.
        </div>
      </div>
    );
  }

  const idDifficulte = enseignant.cours?.idCours ?? null;
  const cellule = (jour, heure) =>
    creneaux.find((c) => c.jour === jour && normHeure(c.heure) === heure);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
        <CalendarDays size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Mon emploi du temps</h1>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 8 }}>
        Classe <b>{enseignant.classe?.libelle || "—"}</b> · vous assurez toutes les matières
        {idDifficulte ? <> sauf <b>{enseignant.cours?.libelle}</b> (assurée par un autre enseignant)</> : null}.
      </p>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      <div style={{ overflowX: "auto", background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, padding: 16, marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 6, minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              {JOURS.map((j) => (
                <th key={j} style={{ padding: "8px", borderRadius: 8, background: "linear-gradient(135deg,#d86310,#ac3b02)", color: "white", fontSize: 13, fontWeight: 700 }}>{j}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEURES.map((h) => (
              <tr key={h}>
                <td style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "right", paddingRight: 6 }}>{h}</td>
                {JOURS.map((j) => {
                  const c = cellule(j, h);
                  if (!c) return <td key={j} style={{ background: "rgba(26,18,8,0.02)", borderRadius: 8, minHeight: 56, height: 56 }} />;
                  const estDiff = idDifficulte && Number(c.cours?.idCours) === Number(idDifficulte);
                  return (
                    <td key={j} style={{ borderRadius: 8, padding: "8px 10px", verticalAlign: "top", background: estDiff ? "rgba(138,112,96,0.08)" : "rgba(216,99,16,0.1)", border: estDiff ? "1px dashed rgba(138,112,96,0.5)" : "1px solid rgba(216,99,16,0.25)" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: estDiff ? "#8a7060" : "#1a1208" }}>{c.cours?.libelle || "Cours"}</div>
                      {estDiff && <div style={{ fontSize: 10.5, color: "#8a7060", marginTop: 3 }}>assuré par un autre</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
