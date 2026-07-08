import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation de suppression",
  impact = [],
  message = "Êtes-vous sûr de vouloir supprimer cet élément ?",
}) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,18,8,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 450, background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-dark)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={24} color="#ef4444" />
            {title}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7060" }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: "#4a3728", fontSize: 15, marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </p>
        
        {impact && impact.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c", marginBottom: 10 }}>
              Attention ! La suppression entraînera également la disparition des éléments suivants :
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: "#991b1b", lineHeight: 1.6 }}>
              {impact.map((item, index) => (
                <li key={index} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--surface-border)", background: "#faf9f7", color: "#4a3728", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "#ef4444", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}
          >
            Oui, supprimer
          </button>
        </div>

      </div>
    </div>
  );
}
