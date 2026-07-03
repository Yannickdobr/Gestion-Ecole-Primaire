// Impression / "PDF" sans dépendance : ouvre une fenêtre isolée, écrit un
// document HTML stylé et déclenche window.print() (→ « Enregistrer en PDF »).

const fmtFCFA = (m) => (Number(m) || 0).toLocaleString("fr-FR") + " FCFA";
const fmtDate = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("fr-FR"); } catch { return d; } };
const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

function ouvrirImpression(titre, corps) {
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) { alert("Autorise les pop-ups pour imprimer."); return; }
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(titre)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1208; margin: 0; padding: 40px; }
    .doc { max-width: 720px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d86310; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 800; color: #d86310; }
    .brand small { display: block; font-size: 11px; color: #8a7060; font-weight: 400; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { font-size: 12px; color: #8a7060; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; padding: 9px 10px; font-size: 13px; border-bottom: 1px solid #eee; }
    th { color: #8a7060; font-weight: 600; }
    .total { display: flex; justify-content: space-between; padding: 12px 14px; background: #faf6f1; border-radius: 8px; font-weight: 700; margin-top: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; font-size: 13px; }
    .grid b { color: #4a3728; }
    .foot { margin-top: 40px; font-size: 11px; color: #8a7060; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 0; } .noprint { display: none; } }
  </style></head><body><div class="doc">
    <div class="head"><div class="brand">BrightSchool<small>Plateforme de gestion scolaire</small></div>
      <div style="text-align:right" class="meta">Émis le ${fmtDate(new Date())}</div></div>
    ${corps}
    <div class="foot">Document généré automatiquement par BrightSchool — fait foi sous réserve de vérification.</div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
  </body></html>`);
  w.document.close();
}

/** Reçu de paiement (un versement). */
export function imprimerRecu({ eleve, paiement, classe, annee }) {
  const corps = `
    <h1>Reçu de paiement</h1>
    <div class="meta">N° ${esc(paiement?.idPaie ?? "—")} · ${fmtDate(paiement?.datePaie)}</div>
    <div class="grid" style="margin:18px 0">
      <div><b>Élève :</b> ${esc(eleve?.prenom)} ${esc(eleve?.nom)}</div>
      <div><b>Matricule :</b> #${esc(eleve?.matricule)}</div>
      <div><b>Classe :</b> ${esc(classe || "—")}</div>
      <div><b>Année :</b> ${esc(annee || "—")}</div>
      <div><b>Mode :</b> ${esc(paiement?.mode?.libelle || "—")}</div>
      <div><b>Date :</b> ${fmtDate(paiement?.datePaie)}</div>
    </div>
    <div class="total"><span>Montant versé</span><span>${fmtFCFA(paiement?.montant)}</span></div>`;
  ouvrirImpression(`Recu_${eleve?.matricule || ""}`, corps);
}

/** Bulletin de notes (une session). */
export function imprimerBulletin({ eleve, session, notes, moyenne, rang, effectif }) {
  const lignes = (notes || []).map((n) =>
    `<tr><td>${esc(n.cours?.libelle || "Cours")}</td><td>${esc(n.cours?.coefficient ?? 1)}</td><td><b>${esc(n.note)}/20</b></td><td>${esc(n.appreciation && n.appreciation !== "RAS" ? n.appreciation : "")}</td></tr>`
  ).join("");
  const corps = `
    <h1>Bulletin de notes</h1>
    <div class="meta">${esc(session || "")}</div>
    <div class="grid" style="margin:18px 0">
      <div><b>Élève :</b> ${esc(eleve?.prenom)} ${esc(eleve?.nom)}</div>
      <div><b>Matricule :</b> #${esc(eleve?.matricule)}</div>
    </div>
    <table><thead><tr><th>Matière</th><th>Coef.</th><th>Note</th><th>Appréciation</th></tr></thead>
      <tbody>${lignes || '<tr><td colspan="4">Aucune note.</td></tr>'}</tbody></table>
    <div class="total"><span>Moyenne générale${rang ? ` · Rang ${rang}${effectif ? "/" + effectif : ""}` : ""}</span><span>${moyenne != null ? Math.round(moyenne * 100) / 100 : "—"}/20</span></div>`;
  ouvrirImpression(`Bulletin_${eleve?.matricule || ""}`, corps);
}
