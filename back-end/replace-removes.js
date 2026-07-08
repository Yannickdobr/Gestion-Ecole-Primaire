const fs = require("fs");
const path = require("path");
const glob = require("glob"); // We will just hardcode the files if glob is not available

const filesToUpdate = [
  "src/administration/administration.service.ts",
  "src/auth/auth.service.ts",
  "src/classe/classes.service.ts",
  "src/cours/cours.service.ts",
  "src/eleves/eleves.service.ts",
  "src/emploi/emploi.service.ts",
  "src/evaluations/evaluations.service.ts",
  "src/messagerie/messagerie.service.ts",
  "src/paiements/paiements.service.ts",
  "src/professeurs/professeurs.service.ts"
];

for (const relPath of filesToUpdate) {
  const filePath = path.join("c:/Users/YANNICK28/Desktop/yannick/Tous mes codes du 3GI/Projet BD/back-end", relPath);
  let content = fs.readFileSync(filePath, "utf8");
  
  // Replacements
  // administration.service.ts
  content = content.replace(/await this\.justifRepo\.remove\(j\);/g, "j.isDelete = 1;\n    await this.justifRepo.save(j);");
  content = content.replace(/await this\.ficheRepo\.remove\(f\);/g, "f.isDelete = 1;\n    await this.ficheRepo.save(f);");
  content = content.replace(/await this\.quartierRepo\.remove\(q\);/g, "q.isDelete = 1;\n    await this.quartierRepo.save(q);");
  content = content.replace(/await this\.residentsRepo\.remove\(r\);/g, "r.isDelete = 1;\n    await this.residentsRepo.save(r);");

  // auth.service.ts
  content = content.replace(/await this\.adminRepository\.remove\(admin\);/g, "admin.isDelete = 1;\n        await this.adminRepository.save(admin);");

  // classe/classes.service.ts
  content = content.replace(/await this\.cycleRepository\.remove\(cycle\);/g, "cycle.isDelete = 1;\n      await this.cycleRepository.save(cycle);");
  content = content.replace(/await this\.classeRepository\.remove\(classe\);/g, "classe.isDelete = 1;\n      await this.classeRepository.save(classe);");
  content = content.replace(/await this\.salleRepository\.remove\(salle\);/g, "salle.isDelete = 1;\n      await this.salleRepository.save(salle);");
  content = content.replace(/await this\.anneeRepository\.remove\(annee\);/g, "annee.isDelete = 1;\n      await this.anneeRepository.save(annee);");
  content = content.replace(/await this\.frequenteRepository\.remove\(frequente\);/g, "frequente.isDelete = 1;\n      await this.frequenteRepository.save(frequente);");

  // cours/cours.service.ts
  content = content.replace(/await this\.coursRepository\.remove\(cours\);/g, "cours.isDelete = 1;\n    await this.coursRepository.save(cours);");
  content = content.replace(/await this\.livresRepository\.remove\(livre\);/g, "livre.isDelete = 1;\n    await this.livresRepository.save(livre);");
  // Skipped: discipline, specialite

  // eleves/eleves.service.ts
  content = content.replace(/await this\.eleveRepository\.remove\(eleve\);/g, "eleve.isDelete = 1;\n      await this.eleveRepository.save(eleve);");

  // emploi/emploi.service.ts
  content = content.replace(/await this\.emploiRepository\.remove\(creneau\);/g, "creneau.isDelete = 1;\n    await this.emploiRepository.save(creneau);");
  content = content.replace(/await this\.emploiRepository\.remove\(creneaux\);/g, "creneaux.forEach(c => c.isDelete = 1);\n    await this.emploiRepository.save(creneaux);");
  // Skipped: jour

  // evaluations/evaluations.service.ts
  content = content.replace(/await this\.epreuveRepository\.remove\(e\);/g, "e.isDelete = 1;\n    await this.epreuveRepository.save(e);");
  content = content.replace(/await this\.evaluationRepository\.remove\(eval_\);/g, "eval_.isDelete = 1;\n    await this.evaluationRepository.save(eval_);");
  content = content.replace(/await this\.rapportRepository\.remove\(r\);/g, "r.isDelete = 1;\n    await this.rapportRepository.save(r);");
  // Skipped: trimestre, session, nature

  // messagerie/messagerie.service.ts
  content = content.replace(/await this\.messagesRepository\.remove\(msg\);/g, "msg.isDelete = 1;\n    await this.messagesRepository.save(msg);");

  // paiements/paiements.service.ts
  content = content.replace(/await this\.scolariteRepository\.remove\(s\);/g, "s.isDelete = 1;\n    await this.scolariteRepository.save(s);");
  content = content.replace(/await this\.trancheRepository\.remove\(t\);/g, "t.isDelete = 1;\n    await this.trancheRepository.save(t);");
  content = content.replace(/await this\.paiementRepository\.remove\(p\);/g, "p.isDelete = 1;\n    await this.paiementRepository.save(p);");
  // Skipped: mode

  // professeurs/professeurs.service.ts
  content = content.replace(/if \(ens\.length\) await m\.remove\(ens\);/g, "if (ens.length) { ens.forEach(e => e.isDelete = 1); await m.save(ens); }");
  content = content.replace(/if \(tits\.length\) await m\.remove\(tits\);/g, "if (tits.length) { tits.forEach(t => t.isDelete = 1); await m.save(tits); }");
  content = content.replace(/await m\.remove\(personne\);/g, "personne.isDelete = 1;\n        await m.save(personne);");
  content = content.replace(/await this\.enseignantRepository\.remove\(enseignant\);/g, "enseignant.isDelete = 1;\n    await this.enseignantRepository.save(enseignant);");
  content = content.replace(/await this\.titulaireRepository\.remove\(titulaire\);/g, "titulaire.isDelete = 1;\n    await this.titulaireRepository.save(titulaire);");

  fs.writeFileSync(filePath, content);
}
console.log("Done replaces");

