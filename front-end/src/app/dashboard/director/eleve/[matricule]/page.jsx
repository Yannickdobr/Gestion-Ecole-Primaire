"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEleve, getNotesEleve, getPaiementsEleve, getParentsEleve,
  getFrequenteByEleve, getRapportsEleve, getAnnees, getArrieresAuto, fichierURL,
} from "@/lib/api";
import { propre } from "@/lib/format";
import {
  ArrowLeft, GraduationCap, BookOpen, Wallet, Users, ShieldAlert, MapPin, Printer,
} from "lucide-react";

const card = { background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 };
const fmt = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";
const fmtMoy = (m) => (Math.round((Number(m) || 0) * 100) / 100).toLocaleString("fr-FR");
const dDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return d; } };

function moyenneDe(notes) {
  let pts = 0, coef = 0;
  for (const n of notes || []) { const c = Number(n.cours?.coefficient) || 1; pts += (Number(n.note) || 0) * c; coef += c; }
  return coef ? pts / coef : null;
}

export default function FicheElevePage() {
  const { matricule } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [eleve, notes, paiements, parents, freq, rapports, annees] = await Promise.all([
          getEleve(matricule),
          getNotesEleve(matricule).catch(() => []),
          getPaiementsEleve(matricule).catch(() => []),
          getParentsEleve(matricule).catch(() => []),
          getFrequenteByEleve(matricule).catch(() => []),
          getRapportsEleve(matricule).catch(() => []),
          getAnnees().catch(() => []),
        ]);
        if (!actif) return;
        const annee = (Array.isArray(annees) ? annees : []).reduce((a, x) => (!a || Number(x.idAnnee) > Number(a.idAnnee) ? x : a), null);
        let arrieres = null;
        if (annee) arrieres = await getArrieresAuto(matricule, annee.idAnnee).catch(() => null);
        if (!actif) return;
        setData({
          eleve,
          notes: Array.isArray(notes) ? notes : [],
          paiements: Array.isArray(paiements) ? paiements : [],
          parents: Array.isArray(parents) ? parents : [],
          freq: Array.isArray(freq) ? freq : [],
          rapports: Array.isArray(rapports) ? rapports : [],
          arrieres, annee,
        });
      } catch (e) { if (actif) setError(e.message || "Élève introuvable."); }
      finally { if (actif) setLoading(false); }
    })();
    return () => { actif = false; };
  }, [matricule]);

  const moyenne = useMemo(() => moyenneDe(data?.notes), [data]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>;
  if (error || !data) return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <button onClick={() => router.back()} style={backBtn}><ArrowLeft size={16} /> Retour</button>
      <div style={{ ...card, marginTop: 16, textAlign: "center", color: "#dc2626" }}>{error || "Introuvable."}</div>
    </div>
  );

  const { eleve, notes, paiements, parents, freq, rapports, arrieres } = data;
  const affectationCourante = data.annee ? freq.find((f) => Number(f.anneeAcademique?.idAnnee) === Number(data.annee.idAnnee)) : freq[0];
  const totalVerse = arrieres ? arrieres.totalPaye : paiements.reduce((a, p) => a + (Number(p.montant) || 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <button onClick={() => router.back()} style={backBtn}><ArrowLeft size={16} /> Retour</button>
        <button onClick={() => window.print()} style={{ ...backBtn, color: "var(--orange)" }}><Printer size={16} /> Imprimer / PDF</button>
      </div>

      {/* En-tête identité */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        {fichierURL(eleve.photoURL) ? (
          <img src={fichierURL(eleve.photoURL)} alt={`${eleve.prenom} ${eleve.nom}`} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--surface-border)" }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, flexShrink: 0 }}>
            {`${(eleve.prenom?.[0] || "")}${(eleve.nom?.[0] || "")}`.toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>{eleve.prenom} {eleve.nom}</h1>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            Matricule #{eleve.matricule} · {Number(eleve.sexe) === 2 ? "Féminin" : "Masculin"} · né(e) le {dDate(eleve.dateNaissance)}
          </div>
        </div>
        <span style={{ padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, background: Number(eleve.actif) === 1 ? "rgba(22,163,74,0.1)" : "rgba(138,112,96,0.12)", color: Number(eleve.actif) === 1 ? "#16a34a" : "#8a7060" }}>
          {Number(eleve.actif) === 1 ? "Actif" : "Inactif"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Infos + scolarité */}
        <div style={card}>
          <Titre icon={<GraduationCap size={18} />} texte="Identité & scolarité" />
          <Ligne label="Lieu de naissance" val={propre(eleve.lieuNaissance)} />
          <Ligne label="Ville" val={propre(eleve.villeNaissance?.libelle)} />
          <Ligne label="Langue" val={propre(eleve.langue)} />
          <Ligne label="Classe actuelle" val={affectationCourante ? `${affectationCourante.salle?.classe?.libelle || "—"} · Salle ${affectationCourante.salle?.libelle || "—"}` : "Non affecté"} />
          <Ligne label="Année" val={propre(affectationCourante?.anneeAcademique?.libelle)} />
        </div>

        {/* Paiements */}
        <div style={card}>
          <Titre icon={<Wallet size={18} />} texte="Scolarité & paiements" />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <Mini label="Versé" val={fmt(totalVerse)} principal />
            <Mini label="Dû" val={arrieres ? fmt(arrieres.totalDu) : "—"} />
            <Mini label="Reste" val={arrieres ? fmt(arrieres.arriere) : "—"} accent={arrieres && arrieres.arriere > 0} />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{paiements.length} versement(s){arrieres?.cycle ? ` · cycle ${arrieres.cycle.libelle}` : ""}</div>
        </div>

        {/* Notes */}
        <div style={card}>
          <Titre icon={<BookOpen size={18} />} texte="Notes" extra={moyenne != null ? <b style={{ color: "var(--orange)" }}>Moy. {fmtMoy(moyenne)}/20</b> : null} />
          {notes.length === 0 ? <Vide t="Aucune note." /> : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {notes.map((n) => (
                <span key={n.idEval} style={{ fontSize: 12.5, padding: "4px 10px", borderRadius: 999, background: "rgba(216,99,16,0.1)", color: "var(--orange)" }}>
                  {n.cours?.libelle || "Cours"} : <b>{n.note}/20</b>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Parents */}
        <div style={card}>
          <Titre icon={<Users size={18} />} texte="Parents / tuteurs" />
          {parents.length === 0 ? <Vide t="Aucun parent rattaché." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {parents.map((p) => (
                <div key={p.idParent} style={{ fontSize: 13.5 }}>
                  <b>{p.personne?.prenom} {p.personne?.nom}</b>
                  <span style={{ color: "var(--muted)" }}> · {propre(p.personne?.username)}{p.personne?.mobile && p.personne.mobile !== "000" ? ` · ${p.personne.mobile}` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historique discipline / absences */}
        <div style={{ ...card, gridColumn: "1 / -1" }}>
          <Titre icon={<ShieldAlert size={18} />} texte="Suivi (discipline / absences)" extra={(() => {
            const nbAbs = rapports.filter((r) => (r.libelle || "").toLowerCase().includes("absence")).length;
            const nbRet = rapports.filter((r) => (r.libelle || "").toLowerCase().includes("retard")).length;
            return <span style={{ color: "var(--muted)", fontSize: 12.5 }}>{rapports.length} fait(s){nbAbs ? ` · ${nbAbs} absence(s)` : ""}{nbRet ? ` · ${nbRet} retard(s)` : ""}</span>;
          })()} />
          {rapports.length === 0 ? <Vide t="Aucun fait consigné." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {rapports.map((r) => (
                <div key={r.idRap} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "#faf9f7", border: "1px solid var(--surface-border)", flexWrap: "wrap" }}>
                  <MapPin size={13} style={{ color: "var(--orange)" }} />
                  <b style={{ fontSize: 13.5 }}>{r.libelle}</b>
                  {Number(r.points) > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{r.points} pt</span>}
                  {r.commentaire && r.commentaire !== "RAS" && <span style={{ fontSize: 12.5, color: "#6b5544" }}>{r.commentaire}</span>}
                  <span style={{ fontSize: 11.5, color: "var(--muted)", marginLeft: "auto" }}>{dDate(r.event_date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const backBtn = { display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--text-dark)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };

function Titre({ icon, texte, extra }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--orange)" }}>
      {icon}<h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>{texte}</h3>
      {extra ? <span style={{ marginLeft: "auto" }}>{extra}</span> : null}
    </div>
  );
}
function Ligne({ label, val }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--surface-border)", fontSize: 13.5 }}>
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "var(--text-dark)", textAlign: "right" }}>{val}</span>
    </div>
  );
}
function Mini({ label, val, principal, accent }) {
  return (
    <div style={{ borderRadius: 12, padding: "10px 14px", minWidth: 90, background: principal ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface-soft)", border: principal ? "none" : "1px solid var(--surface-border)" }}>
      <div style={{ fontSize: 11.5, color: principal ? "rgba(255,255,255,0.85)" : "var(--muted)" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: accent ? "#ef4444" : (principal ? "white" : "var(--text-dark)") }}>{val}</div>
    </div>
  );
}
function Vide({ t }) { return <div style={{ color: "var(--muted)", fontSize: 13, padding: "6px 0" }}>{t}</div>; }
