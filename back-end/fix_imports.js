const fs = require('fs');

// Fix classes.service.ts
let fileClasse = 'src/classe/classes.service.ts';
let contentClasse = fs.readFileSync(fileClasse, 'utf8');

if (!contentClasse.includes('Session } from')) {
  contentClasse = contentClasse.replace(
    "import { Trimestre } from '../entities/trimestre.entity';",
    "import { Trimestre } from '../entities/trimestre.entity';\nimport { Session } from '../entities/session.entity';\nimport { Evaluation } from '../entities/evaluation.entity';"
  );
  fs.writeFileSync(fileClasse, contentClasse);
}

// Fix professeurs.service.ts
let fileProf = 'src/professeurs/professeurs.service.ts';
let contentProf = fs.readFileSync(fileProf, 'utf8');

if (!contentProf.includes('verifierAvantSuppression')) {
  contentProf = contentProf.replace(
    "import { InjectRepository } from '@nestjs/typeorm';",
    "import { InjectRepository } from '@nestjs/typeorm';\nimport { verifierAvantSuppression } from '../common/referential-integrity';\nimport { Parents } from '../entities/parents.entity';\nimport { Residents } from '../entities/residents.entity';"
  );
  fs.writeFileSync(fileProf, contentProf);
}

console.log('done');
