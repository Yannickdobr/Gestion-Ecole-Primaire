const fs = require("fs");
let content = fs.readFileSync("src/eleves/eleves.service.ts", "utf8");

const oldRemove = `  async remove(matricule: number): Promise<{ message: string }> {
    const eleve = await this.findOne(matricule);
    const m = this.eleveRepository.manager;
    const [frequentations, parents, paiements, notes, bulletins] = await Promise.all([
      m.count(Frequente, { where: { eleve: { matricule } } }),
      m.count(Parents, { where: { eleve: { matricule } } }),
      m.count(Paiement, { where: { eleve: { matricule } } }),
      m.count(Evaluation, { where: { eleve: { matricule } } }),
      m.count(Rapport, { where: { eleve: { matricule } } }),
    ]);
    const liens: string[] = [];
    if (frequentations) liens.push(\`\${frequentations} affectation(s)\`);
    if (parents) liens.push(\`\${parents} lien(s) parent\`);
    if (paiements) liens.push(\`\${paiements} paiement(s)\`);
    if (notes) liens.push(\`\${notes} note(s)\`);
    if (bulletins) liens.push(\`\${bulletins} bulletin(s)\`);
    if (liens.length) {
      throw new ConflictException(
        \`Impossible de supprimer d?finitivement cet ?lve : \${liens.join(", ")} lui sont rattach?(s). \` +
          \`Utilisez plutt la d?sactivation pour conserver l"historique.\`,
      );
    }
    eleve.isDelete = 1;
    await this.eleveRepository.save(eleve);
    return { message: \`%lve matricule \${matricule} supprim? d?finitivement\` };
  }`;

// Find the start of remove method
const startIdx = content.indexOf("async remove(matricule: number)");
const endIdx = content.indexOf("async getParents", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newRemove = `async remove(matricule: number, force: boolean = false): Promise<{ message: string }> {
    const eleve = await this.findOne(matricule);
    await verifierAvantSuppression(
      this.eleveRepository.manager,
      \`l"élève "\${eleve.prenom} \${eleve.nom}"\`,
      [
        { entity: Frequente, where: { eleve: { matricule } }, label: (n) => \`\${n} affectation(s)\` },
        { entity: Parents, where: { eleve: { matricule } }, label: (n) => \`\${n} lien(s) parent\` },
        { entity: Paiement, where: { eleve: { matricule } }, label: (n) => \`\${n} paiement(s)\` },
        { entity: Evaluation, where: { eleve: { matricule } }, label: (n) => \`\${n} note(s)\` },
        { entity: Rapport, where: { eleve: { matricule } }, label: (n) => \`\${n} bulletin(s)\` },
      ],
      force
    );
    eleve.isDelete = 1;
    await this.eleveRepository.save(eleve);
    return { message: \`Élève matricule \${matricule} supprimé définitivement\` };
  }

  `;
    content = content.substring(0, startIdx) + newRemove + content.substring(endIdx);
    fs.writeFileSync("src/eleves/eleves.service.ts", content);
    console.log("Replaced remove in eleves.service.ts");
} else {
    console.log("Could not find boundaries.");
}

