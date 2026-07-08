"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";
import {
  getLivres,
  createLivre,
  updateLivre,
  deleteLivre,
  getSpecialites,
} from "@/lib/api";
import { BookOpen, Plus, Trash2, Edit, Search, X } from "lucide-react";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

const thStyle = { padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--surface-border)" };
const tdStyle = { padding: "16px 24px", fontSize: 14, color: "var(--text-dark)", borderBottom: "1px solid var(--surface-border)" };
const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid var(--surface-border)", fontSize: 14, fontFamily: "inherit", background: "#faf9f7", outline: "none", boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a3728", marginBottom: 6 };

const FORM_VIDE = { titre: "", auteurs: "", prix: "", edition: "", annee_parution: "", totalCopie: 1, idSpecialite: "" };

export default function BibliothequePage() {
  const { user } = useAuth();
  const [livres, setLivres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, impact: [], message: "" });
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Modal
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [formErreur, setFormErreur] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const charger = async () => {
    try {
      const [resLivres, resSpe] = await Promise.all([getLivres(), getSpecialites()]);
      setLivres(resLivres || []);
      setSpecialites(resSpe || []);
    } catch (err) {
      setError(err.message || "Échec du chargement de la bibliothèque.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const livresFiltres = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return livres;
    return livres.filter(
      (l) =>
        l.titre?.toLowerCase().includes(q) ||
        l.auteurs?.toLowerCase().includes(q) ||
        l.edition?.toLowerCase().includes(q)
    );
  }, [livres, query]);

  const majForm = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setIsEditing(false);
    setEditingId(null);
    setFormErreur("");
    setModalOuvert(true);
  };

  const ouvrirEdition = (livre) => {
    setForm({
      titre: livre.titre || "",
      auteurs: livre.auteurs || "",
      prix: livre.prix || "",
      edition: livre.edition || "",
      annee_parution: livre.annee_parution ? livre.annee_parution.split("T")[0] : "",
      totalCopie: livre.totalCopie || 1,
      idSpecialite: livre.specialite?.idSpecialite || "",
    });
    setIsEditing(true);
    setEditingId(livre.idLivre);
    setFormErreur("");
    setModalOuvert(true);
  };

  const soumettre = async (ev) => {
    ev.preventDefault();
    setFormErreur("");
    if (!form.titre || !form.idSpecialite) {
      setFormErreur("Le titre et la spécialité sont obligatoires.");
      return;
    }

    const payload = {
      ...form,
      prix: Number(form.prix) || 0,
      totalCopie: Number(form.totalCopie) || 1,
      idSpecialite: Number(form.idSpecialite),
      idAdmin: user?.id ? Number(user.id) : undefined, // L'admin qui enregistre
    };

    setEnvoi(true);
    try {
      if (isEditing) {
        await updateLivre(editingId, payload);
      } else {
        await createLivre(payload);
      }
      setModalOuvert(false);
      await charger();
    } catch (e) {
      setFormErreur(e.message || "Erreur lors de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (livre, force = false) => {
    setBusyId(livre.idLivre);
    try {
      await deleteLivre(livre.idLivre, force);
      if (deleteModal.isOpen) setDeleteModal({ isOpen: false, item: null, impact: [], message: "" });
      await charger();
    } catch (e) {
      if (e.requireConfirmation) {
        setDeleteModal({ isOpen: true, item: livre, impact: e.impact, message: e.message });
      } else {
        alert(e.message || "Échec de la suppression.");
      }
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Chargement de la bibliothèque...</div>;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>{error}</div>;

  return (
    <div>
      <DashboardHeader
        title="Bibliothèque"
        subtitle="Gérez l'inventaire des livres de l'établissement."
        icon={<BookOpen size={28} color="var(--orange)" />}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Confirmation de suppression"
        message={deleteModal.message}
        impact={deleteModal.impact}
        onClose={() => setDeleteModal({ isOpen: false, item: null, impact: [], message: "" })}
        onConfirm={() => supprimer(deleteModal.item, deleteModal.impact && deleteModal.impact.length > 0)}
      />

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 250 }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Rechercher par titre, auteur, édition..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 44 }}
          />
        </div>
        <button
          onClick={ouvrirCreation}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 24px", borderRadius: 12, background: "var(--orange)", color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={18} />
          Ajouter un livre
        </button>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 24, border: "1px solid var(--surface-border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr>
                <th style={thStyle}>Livre</th>
                <th style={thStyle}>Auteur(s)</th>
                <th style={thStyle}>Spécialité</th>
                <th style={thStyle}>Édition</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Copies</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {livresFiltres.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "var(--muted)" }}>
                    Aucun livre trouvé.
                  </td>
                </tr>
              ) : (
                livresFiltres.map((livre) => (
                  <tr key={livre.idLivre}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{livre.titre}</td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{livre.auteurs === "INDEFINI" ? "—" : livre.auteurs}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "rgba(138,112,96,0.1)", color: "#8a7060" }}>
                        {livre.specialite?.libelle || "Non définie"}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "var(--muted)" }}>{livre.edition === "INDEFINI" ? "—" : livre.edition}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{livre.totalCopie}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => ouvrirEdition(livre)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--text-dark)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          <Edit size={14} />
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item: livre, impact: [], message: "Voulez-vous vraiment supprimer ce livre ?" })}
                          disabled={busyId === livre.idLivre}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                          {busyId === livre.idLivre ? "..." : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOuvert && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--surface)", width: "100%", maxWidth: 600, borderRadius: 24, padding: 32, position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
            <button onClick={() => setModalOuvert(false)} style={{ position: "absolute", top: 24, right: 24, background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)" }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-dark)", marginBottom: 24 }}>
              {isEditing ? "Modifier le livre" : "Ajouter un livre"}
            </h2>

            {formErreur && (
              <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
                {formErreur}
              </div>
            )}

            <form onSubmit={soumettre} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Titre *</label>
                  <input type="text" required value={form.titre} onChange={(e) => majForm("titre", e.target.value)} style={inputStyle} placeholder="Ex: Mathématiques 6ème" />
                </div>
                <div>
                  <label style={labelStyle}>Auteur(s)</label>
                  <input type="text" value={form.auteurs} onChange={(e) => majForm("auteurs", e.target.value)} style={inputStyle} placeholder="Ex: Jean Dupont" />
                </div>
                <div>
                  <label style={labelStyle}>Spécialité *</label>
                  <select required value={form.idSpecialite} onChange={(e) => majForm("idSpecialite", e.target.value)} style={inputStyle}>
                    <option value="">Sélectionnez...</option>
                    {specialites.map((s) => (
                      <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Édition</label>
                  <input type="text" value={form.edition} onChange={(e) => majForm("edition", e.target.value)} style={inputStyle} placeholder="Ex: Hachette" />
                </div>
                <div>
                  <label style={labelStyle}>Date de parution</label>
                  <input type="date" value={form.annee_parution} onChange={(e) => majForm("annee_parution", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Prix</label>
                  <input type="number" min="0" step="0.01" value={form.prix} onChange={(e) => majForm("prix", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nombre de copies</label>
                  <input type="number" required min="1" value={form.totalCopie} onChange={(e) => majForm("totalCopie", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setModalOuvert(false)} style={{ padding: "11px 20px", borderRadius: 12, background: "transparent", border: "1px solid var(--surface-border)", color: "var(--text-dark)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                <button type="submit" disabled={envoi} style={{ padding: "11px 24px", borderRadius: 12, background: "var(--orange)", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: envoi ? "not-allowed" : "pointer" }}>
                  {envoi ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
