"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getElevesActifs, getEleves, getAnnees, getMesMessages,
  getArrieresAuto, getParentsEleve,
} from "@/lib/api";
import {
  GraduationCap, CreditCard, MessageSquare, UserPlus,
  AlertTriangle, ClipboardList, Wallet,
} from "lucide-react";

const fmt = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";

// On limite les appels d'arriérés par élève pour rester léger
const MAX_SUIVI = 60;

export default function ScolariteHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nbEleves, setNbEleves] = useState(0);
  const [encaisse, setEncaisse] = useState(0);
  const [resteGlobal, setResteGlobal] = useState(0);
  const [nbMsg, setNbMsg] = useState(0);
  const [anneeLib, setAnneeLib] = useState("");
  const [aFinaliser, setAFinaliser] = useState([]); // {matricule, nom, sansClasse, sansParent}
  const [recouvrement, setRecouvrement] = useState([]); // {matricule, nom, classe, arriere}

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const [elActifs, annees, msgs] = await Promise.all([
          getElevesActifs().catch(() => getEleves()),
          getAnnees().catch(() => []),
          getMesMessages().catch(() => []),
        ]);
        if (!actif) return;
        const eleves = Array.isArray(elActifs) ? elActifs : [];
        setNbEleves(eleves.length);
        setNbMsg((Array.isArray(msgs) ? msgs : []).filter((m) => Number(m.valider) === 1).length);

        // Année la plus récente (idAnnee max)
        const annee = (Array.isArray(annees) ? annees : []).reduce(
          (acc, a) => (!acc || Number(a.idAnnee) > Number(acc.idAnnee) ? a : acc), null);
        setAnneeLib(annee?.libelle || "");

        if (!annee) { setLoading(false); return; }

        // Récents d'abord (matricule décroissant), plafonné
        const recents = [...eleves].sort((a, b) => Number(b.matricule) - Number(a.matricule)).slice(0, MAX_SUIVI);
        const details = await Promise.all(recents.map(async (el) => {
          const [arr, parents] = await Promise.all([
            getArrieresAuto(el.matricule, annee.idAnnee).catch(() => null),
            getParentsEleve(el.matricule).catch(() => []),
          ]);
          return { el, arr, parents: Array.isArray(parents) ? parents : [] };
        }));
        if (!actif) return;

        let totPaye = 0, totReste = 0;
        const finals = [], recouvre = [];
        for (const { el, arr, parents } of details) {
          const nomComplet = `${el.prenom} ${el.nom}`;
          const sansClasse = !arr || !arr.classe;
          const sansParent = parents.length === 0;
          if (arr) { totPaye += Number(arr.totalPaye) || 0; totReste += Number(arr.arriere) || 0; }
          if (sansClasse || sansParent) {
            finals.push({ matricule: el.matricule, nom: nomComplet, sansClasse, sansParent });
          }
          if (arr && Number(arr.arriere) > 0) {
            recouvre.push({ matricule: el.matricule, nom: nomComplet, classe: arr.classe?.libelle || "—", arriere: Number(arr.arriere) });
          }
        }
        setEncaisse(totPaye);
        setResteGlobal(totReste);
        setAFinaliser(finals);
        setRecouvrement(recouvre.sort((a, b) => b.arriere - a.arriere));
      } catch (e) {
        if (actif) setError(e.message || "Erreur de chargement.");
      } finally {
        if (actif) setLoading(false);
      }
    })();
    return () => { actif = false; };
  }, []);

  const kpis = [
    { label: "Élèves actifs", val: nbEleves, icon: <GraduationCap size={20} />, href: "/dashboard/scolarite/students" },
    { label: `Encaissé ${anneeLib ? "(" + anneeLib + ")" : ""}`, val: fmt(encaisse), icon: <Wallet size={20} />, href: "/dashboard/scolarite/payments" },
    { label: "Reste à recouvrer", val: fmt(resteGlobal), icon: <CreditCard size={20} />, accent: resteGlobal > 0, href: "/dashboard/scolarite/payments" },
    { label: "Messages envoyés", val: nbMsg, icon: <MessageSquare size={20} />, href: "/dashboard/scolarite/messages" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>
          Bonjour {user?.nom || user?.username}
        </h1>
        <Link href="/dashboard/scolarite/students" style={{ textDecoration: "none" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white" }}>
            <UserPlus size={16} /> Inscrire un élève
          </span>
        </Link>
      </div>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>Espace scolarité — inscriptions, encaissements et communication.</p>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 16, padding: "18px 20px", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--orange)", marginBottom: 8 }}>{k.icon}<span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{k.label}</span></div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", color: k.accent ? "#ef4444" : "var(--text-dark)" }}>{loading ? "…" : k.val}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Inscriptions à finaliser */}
        <Panneau titre="Inscriptions à finaliser" icon={<ClipboardList size={18} />} compteur={aFinaliser.length}>
          {loading ? <Vide texte="Chargement…" /> : aFinaliser.length === 0 ? (
            <Vide texte="Tout est en ordre : chaque élève récent a une classe et un parent." />
          ) : (
            aFinaliser.map((e) => (
              <div key={e.matricule} style={ligneStyle}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>{e.nom}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>#{e.matricule}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {e.sansClasse && <Tag couleur="#d86310" texte="Sans classe" />}
                  {e.sansParent && <Tag couleur="#8a7060" texte="Sans parent" />}
                </div>
              </div>
            ))
          )}
        </Panneau>

        {/* Recouvrement */}
        <Panneau titre="Recouvrement" icon={<AlertTriangle size={18} />} compteur={recouvrement.length}>
          {loading ? <Vide texte="Chargement…" /> : recouvrement.length === 0 ? (
            <Vide texte="Aucun arriéré : tous les élèves suivis sont à jour." />
          ) : (
            recouvrement.map((e) => (
              <div key={e.matricule} style={ligneStyle}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark)" }}>{e.nom}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.classe} · #{e.matricule}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", fontFamily: "var(--font-display)" }}>{fmt(e.arriere)}</div>
              </div>
            ))
          )}
        </Panneau>
      </div>
    </div>
  );
}

const ligneStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 18px", borderBottom: "1px solid var(--surface-border)" };

function Panneau({ titre, icon, compteur, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 18px", borderBottom: "1px solid var(--surface-border)", color: "var(--orange)" }}>
        {icon}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}>{titre}</h3>
        {compteur > 0 && <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: "rgba(216,99,16,0.12)", color: "var(--orange)" }}>{compteur}</span>}
      </div>
      <div style={{ maxHeight: 360, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

function Tag({ couleur, texte }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: `${couleur}1a`, color: couleur }}>{texte}</span>;
}

function Vide({ texte }) {
  return <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>{texte}</div>;
}
