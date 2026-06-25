"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import { getLivres, createLivre, getSpecialites, createSpecialite } from "@/lib/api";
import { BookOpen, Plus, Tag } from "lucide-react";

const thStyle = { padding: "12px 18px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "12px 18px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 5 };

const fmtPrix = (p) => (Number(p) || 0).toLocaleString("fr-FR") + " FCFA";

export default function BibliothequePage() {
  const { user } = useAuth();
  const idAdmin = user?.role === "admin" && user?.id ? Number(user.id) : undefined;
  const [tab, setTab] = useState("livres");
  const [livres, setLivres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const [fLivre, setFLivre] = useState({ titre: "", auteurs: "", prix: "", edition: "", annee_parution: "", totalCopie: "", idSpecialite: "" });
  const [fSpec, setFSpec] = useState({ libelle: "" });

  const charger = useCallback(async () => {
    setError("");
    try {
      const [l, s] = await Promise.all([getLivres().catch(() => []), getSpecialites().catch(() => [])]);
      setLivres(Array.isArray(l) ? l : []);
      setSpecialites(Array.isArray(s) ? s : []);
    } catch (e) { setError(e.message || "Erreur de chargement."); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ajouterLivre = async (e) => {
    e.preventDefault(); setError("");
    if (!fLivre.titre.trim() || fLivre.prix === "") { setError("Titre et prix requis."); return; }
    setEnvoi(true);
    try {
      await createLivre({
        titre: fLivre.titre.trim(),
        auteurs: fLivre.auteurs.trim() || undefined,
        prix: Number(fLivre.prix),
        edition: fLivre.edition.trim() || undefined,
        annee_parution: fLivre.annee_parution || undefined,
        totalCopie: fLivre.totalCopie === "" ? undefined : Number(fLivre.totalCopie),
        idSpecialite: fLivre.idSpecialite ? Number(fLivre.idSpecialite) : undefined,
        idAdmin,
      });
      setFLivre({ titre: "", auteurs: "", prix: "", edition: "", annee_parution: "", totalCopie: "", idSpecialite: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de l'ajout du livre."); }
    finally { setEnvoi(false); }
  };

  const ajouterSpec = async (e) => {
    e.preventDefault(); setError("");
    if (!fSpec.libelle.trim()) { setError("Libellé requis."); return; }
    setEnvoi(true);
    try {
      await createSpecialite({ libelle: fSpec.libelle.trim(), idAdmin });
      setFSpec({ libelle: "" });
      await charger();
    } catch (err) { setError(err.message || "Échec de l'ajout."); }
    finally { setEnvoi(false); }
  };

  const tabs = [{ key: "livres", label: "Livres" }, { key: "specialites", label: "Spécialités" }];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <DashboardHeader />
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <BookOpen size={28} style={{ color: "var(--orange)" }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)" }}>Bibliothèque</h1>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabs.map((tb) => {
          const active = tab === tb.key;
          return <button key={tb.key} onClick={() => setTab(tb.key)} style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, background: active ? "linear-gradient(135deg, var(--orange), var(--brown))" : "var(--surface)", color: active ? "white" : "var(--muted)" }}>{tb.label}</button>;
        })}
      </div>

      {error && <div style={{ padding: "12px 16px", marginBottom: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 14 }}>{error}</div>}

      {tab === "livres" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Titre</th><th style={thStyle}>Auteur(s)</th><th style={thStyle}>Prix</th><th style={thStyle}>Copies</th></tr></thead>
              <tbody>
                {livres.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }} colSpan={4}>Catalogue vide.</td></tr> :
                  livres.map((l) => (
                    <tr key={l.idLivre ?? l.ID ?? l.titre}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{l.titre}{l.specialite ? <span style={{ fontSize: 11, color: "var(--orange)", marginLeft: 8 }}>{l.specialite.libelle}</span> : null}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{l.auteurs && l.auteurs !== "INDEFINI" ? l.auteurs : "—"}</td>
                      <td style={{ ...tdStyle }}>{fmtPrix(l.prix)}</td>
                      <td style={{ ...tdStyle, color: "var(--muted)" }}>{l.totalCopie ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={ajouterLivre} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Ajouter un livre</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={labelStyle}>Titre *</label><input style={inputStyle} value={fLivre.titre} onChange={(e) => setFLivre((f) => ({ ...f, titre: e.target.value }))} /></div>
              <div><label style={labelStyle}>Auteur(s)</label><input style={inputStyle} value={fLivre.auteurs} onChange={(e) => setFLivre((f) => ({ ...f, auteurs: e.target.value }))} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Prix *</label><input type="number" min="0" style={inputStyle} value={fLivre.prix} onChange={(e) => setFLivre((f) => ({ ...f, prix: e.target.value }))} /></div>
                <div><label style={labelStyle}>Copies</label><input type="number" min="1" style={inputStyle} value={fLivre.totalCopie} onChange={(e) => setFLivre((f) => ({ ...f, totalCopie: e.target.value }))} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={labelStyle}>Édition</label><input style={inputStyle} value={fLivre.edition} onChange={(e) => setFLivre((f) => ({ ...f, edition: e.target.value }))} /></div>
                <div><label style={labelStyle}>Parution</label><input type="date" style={inputStyle} value={fLivre.annee_parution} onChange={(e) => setFLivre((f) => ({ ...f, annee_parution: e.target.value }))} /></div>
              </div>
              <div>
                <label style={labelStyle}>Spécialité</label>
                <select style={inputStyle} value={fLivre.idSpecialite} onChange={(e) => setFLivre((f) => ({ ...f, idSpecialite: e.target.value }))}>
                  <option value="">— Aucune —</option>
                  {specialites.map((s) => <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>)}
                </select>
              </div>
              <button type="submit" disabled={envoi} style={{ padding: "10px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "…" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}

      {tab === "specialites" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 20, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th style={thStyle}>Spécialité</th></tr></thead>
              <tbody>
                {specialites.length === 0 ? <tr><td style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }}>Aucune spécialité.</td></tr> :
                  specialites.map((s) => <tr key={s.idSpecialite}><td style={{ ...tdStyle, fontWeight: 600 }}><Tag size={14} style={{ color: "var(--orange)", marginRight: 8, verticalAlign: "middle" }} />{s.libelle}</td></tr>)}
              </tbody>
            </table>
          </div>
          <form onSubmit={ajouterSpec} style={{ background: "var(--surface)", border: "1px solid var(--surface-border)", borderRadius: 18, padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><Plus size={16} style={{ color: "var(--orange)" }} /> Ajouter une spécialité</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div><label style={labelStyle}>Libellé *</label><input style={inputStyle} value={fSpec.libelle} onChange={(e) => setFSpec({ libelle: e.target.value })} placeholder="ex : Sciences, Littérature…" /></div>
              <button type="submit" disabled={envoi} style={{ padding: "10px", borderRadius: 10, border: "none", background: envoi ? "rgba(216,99,16,0.5)" : "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer", fontFamily: "inherit" }}>{envoi ? "…" : "Ajouter"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
