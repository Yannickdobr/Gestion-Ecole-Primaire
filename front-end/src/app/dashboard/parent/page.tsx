"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getElevesByParent, getNotesEleve, getPaiementsEleve, getMesMessages } from "@/lib/api";
import ChangePassword from "@/components/ChangePassword";
import { LogOut, GraduationCap, BookOpen, Wallet, Mail } from "lucide-react";

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
  }, [user?.id]);

  const selectionner = async (enfant: any) => {
    setSelection(enfant);
    setLoadingDetail(true);
    try {
      const [n, p] = await Promise.all([
        getNotesEleve(enfant.matricule),
        getPaiementsEleve(enfant.matricule),
      ]);
      setNotes(Array.isArray(n) ? n : []);
      setPaiements(Array.isArray(p) ? p : []);
    } catch {
      setNotes([]);
      setPaiements([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const totalPaye = paiements.reduce((acc, p) => acc + (Number(p.montant) || 0), 0);

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
            {/* Cartes enfants */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
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

            {/* Détail de l'enfant sélectionné */}
            {selection && (
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
                {/* Notes */}
                <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--surface-border, #eee)", display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={18} style={{ color: "var(--orange)" }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Notes de {selection.prenom}</h3>
                  </div>
                  {loadingDetail ? (
                    <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
                  ) : (
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
                              <td style={{ padding: "12px 24px", fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--surface-border, #eee)" }}>{n.note}</td>
                              <td style={{ padding: "12px 24px", fontSize: 14, color: "var(--muted)", borderBottom: "1px solid var(--surface-border, #eee)" }}>{n.appreciation || "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Paiements */}
                <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--surface-border, #eee)", borderRadius: 20, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Wallet size={18} style={{ color: "var(--orange)" }} />
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-dark)" }}>Scolarité</h3>
                  </div>
                  <div style={{ background: "linear-gradient(135deg, var(--orange), var(--brown))", color: "white", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>Total versé</div>
                    <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>{formatMontant(totalPaye)}</div>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>
                    {loadingDetail ? "Chargement…" : `${paiements.length} versement(s) enregistré(s)`}
                  </div>
                </div>
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
