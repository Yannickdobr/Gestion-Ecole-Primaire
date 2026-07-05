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
export function imprimerBulletin({ eleve, session, notes, moyenne, rang = null, effectif = null }) {
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

/** PV de délibération (décisions de passage d'une classe). */
export function imprimerPV({ classe, session, annee, lignes }) {
  const rows = (lignes || []).map((l, i) =>
    `<tr><td>${i + 1}</td><td>${esc(l.prenom)} ${esc(l.nom)}</td><td>#${esc(l.matricule)}</td><td><b>${l.moyenne != null ? Math.round(l.moyenne * 100) / 100 + "/20" : "—"}</b></td><td>${esc(l.decision || "—")}</td></tr>`,
  ).join("");
  const corps = `
    <h1>Procès-verbal de délibération</h1>
    <div class="meta">Classe ${esc(classe || "—")}${session ? ` · ${esc(session)}` : ""}${annee ? ` · ${esc(annee)}` : ""}</div>
    <table><thead><tr><th>#</th><th>Élève</th><th>Matricule</th><th>Moyenne</th><th>Décision</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">Aucune décision.</td></tr>'}</tbody></table>
    <div style="margin-top:40px;display:flex;justify-content:space-between;font-size:12px;color:#4a3728">
      <div>Le Directeur<br/><br/>__________________</div>
      <div>Le Titulaire<br/><br/>__________________</div>
    </div>`;
  ouvrirImpression(`PV_${esc(classe || "")}`, corps);
}

/** Carte d'élève (format simple imprimable). */
export function imprimerCarte({ eleve, classe, annee }) {
  const corps = `
    <h1>Carte d'élève</h1>
    <div class="meta">Année ${esc(annee || "—")}</div>
    <div style="display:flex;gap:24px;align-items:center;margin:20px 0;padding:18px;border:2px solid #d86310;border-radius:12px">
      ${eleve?.photoURL && eleve.photoURL !== "INDEFINI" ? `<img src="${esc(eleve.photoURL)}" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid #eee"/>` : `<div style="width:96px;height:96px;border-radius:8px;background:#faf6f1;display:flex;align-items:center;justify-content:center;color:#8a7060;font-size:12px">Photo</div>`}
      <div class="grid" style="grid-template-columns:1fr">
        <div><b>Nom :</b> ${esc(eleve?.nom)}</div>
        <div><b>Prénom :</b> ${esc(eleve?.prenom)}</div>
        <div><b>Matricule :</b> #${esc(eleve?.matricule)}</div>
        <div><b>Classe :</b> ${esc(classe || "—")}</div>
        <div><b>Né(e) le :</b> ${fmtDate(eleve?.dateNaissance)}</div>
        ${eleve?.groupeSanguin ? `<div><b>Groupe sanguin :</b> ${esc(eleve.groupeSanguin)}</div>` : ""}
      </div>
    </div>`;
  ouvrirImpression(`Carte_${eleve?.matricule || ""}`, corps);
}

/** Emploi du temps (grille jours × heures). */
export function imprimerEmploi({ titre, jours, heures, cellule }) {
  const thJours = (jours || []).map((j) => `<th>${esc(j)}</th>`).join("");
  const rows = (heures || []).map((h) => {
    const tds = (jours || []).map((j) => `<td>${esc(cellule ? cellule(j, h) : "")}</td>`).join("");
    return `<tr><td style="font-weight:700;white-space:nowrap">${esc(h)}</td>${tds}</tr>`;
  }).join("");
  const corps = `
    <h1>Emploi du temps</h1>
    <div class="meta">${esc(titre || "")}</div>
    <table><thead><tr><th>Heure</th>${thJours}</tr></thead>
      <tbody>${rows || '<tr><td>Aucun créneau.</td></tr>'}</tbody></table>`;
  ouvrirImpression(`EDT_${esc(titre || "")}`, corps);
}

/** Certificat de scolarité pré-rempli. */
export function imprimerAttestation({ eleve, classe, annee }) {
  const corps = `
    <h1>Certificat de scolarité</h1>
    <div class="meta">Année scolaire ${esc(annee || "—")}</div>
    <p style="margin:24px 0;line-height:1.9;font-size:14px">
      Le Directeur de l'établissement <b>BrightSchool</b> certifie que l'élève
      <b>${esc(eleve?.prenom)} ${esc(eleve?.nom)}</b>, matricule <b>#${esc(eleve?.matricule)}</b>,
      né(e) le <b>${fmtDate(eleve?.dateNaissance)}</b>, est régulièrement inscrit(e) et fréquente la classe de
      <b>${esc(classe || "—")}</b> au titre de l'année scolaire <b>${esc(annee || "—")}</b>.
    </p>
    <p style="font-size:14px">En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.</p>
    <div style="margin-top:48px;text-align:right;font-size:13px;color:#4a3728">Le Directeur<br/><br/>__________________</div>`;
  ouvrirImpression(`Certificat_${eleve?.matricule || ""}`, corps);
}
