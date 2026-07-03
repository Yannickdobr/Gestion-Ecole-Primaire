"use client";

import { useRef, useState } from "react";
import { uploadFichier, fichierURL } from "@/lib/api";
import { UploadCloud, Check, X, Loader2 } from "lucide-react";

/**
 * Champ de téléversement réutilisable.
 * Props :
 *   value      : chemin actuel (/uploads/...) ou ""
 *   onUploaded : (url) => void  — appelé avec le chemin renvoyé par le backend
 *   accept     : filtre du input file (ex: "image/*")
 *   apercu     : true → affiche une vignette image
 *   label      : libellé du bouton
 */
export default function FileUpload({ value, onUploaded, accept = "image/*", apercu = false, label = "Choisir un fichier" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [nom, setNom] = useState("");

  const choisir = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr(""); setNom(file.name);
    try {
      const r = await uploadFichier(file);
      onUploaded?.(r.url);
    } catch (e2) { setErr(e2.message || "Échec de l'upload."); setNom(""); }
    finally { setBusy(false); }
  };

  const url = fichierURL(value);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {apercu && url && (
          <img src={url} alt="aperçu" style={{ width: 46, height: 46, borderRadius: 10, objectFit: "cover", border: "1px solid var(--surface-border)" }} />
        )}
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "1px solid var(--surface-border)", background: "var(--surface)", color: "var(--text-dark)", fontSize: 13.5, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {busy ? <Loader2 size={15} className="spin" /> : <UploadCloud size={15} style={{ color: "var(--orange)" }} />}
          {busy ? "Envoi…" : label}
        </button>
        {!busy && value && value !== "INDEFINI" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#16a34a", fontWeight: 600 }}>
            <Check size={14} /> {nom || "Fichier enregistré"}
          </span>
        )}
        {value && value !== "INDEFINI" && (
          <button type="button" onClick={() => { onUploaded?.(""); setNom(""); }} title="Retirer" style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2 }}><X size={15} /></button>
        )}
      </div>
      {err && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{err}</div>}
      <input ref={ref} type="file" accept={accept} onChange={choisir} style={{ display: "none" }} />
    </div>
  );
}
