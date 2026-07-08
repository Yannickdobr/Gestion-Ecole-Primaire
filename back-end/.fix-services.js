const fs = require('fs');
const methodsToUpdate = [
  { file: 'src/classe/classes.service.ts', method: 'removeAffectation' },
  { file: 'src/cours/cours.service.ts', method: 'removeDiscipline' },
  { file: 'src/cours/cours.service.ts', method: 'removeLivre' },
  { file: 'src/emploi/emploi.service.ts', method: 'removeJour' },
  { file: 'src/emploi/emploi.service.ts', method: 'removeCreneau' },
  { file: 'src/evaluations/evaluations.service.ts', method: 'removeEpreuve' },
  { file: 'src/evaluations/evaluations.service.ts', method: 'removeNote' },
  { file: 'src/evaluations/evaluations.service.ts', method: 'removeRapport' },
  { file: 'src/messagerie/messagerie.service.ts', method: 'removeMessage' },
  { file: 'src/paiements/paiements.service.ts', method: 'removeTranche' },
  { file: 'src/paiements/paiements.service.ts', method: 'removePaiement' },
  { file: 'src/professeurs/professeurs.service.ts', method: 'removeEnseignant' },
  { file: 'src/professeurs/professeurs.service.ts', method: 'removeTitulaire' },
];

methodsToUpdate.forEach(({file, method}) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = new RegExp(`(async\\s+${method}\\s*\\([^,:]+:\\s*number)\\)`, 'g');
    content = content.replace(regex, `$1, force: boolean = false)`);
    fs.writeFileSync(file, content);
    console.log(`Updated ${method} in ${file}`);
  }
});
