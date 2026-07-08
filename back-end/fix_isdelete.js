const fs = require('fs');
let file = 'src/classe/classes.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Fix createSalle & updateSalle
content = content.replace(
  /where: \{ idClasse: dto\.idClasse \}/g,
  'where: { idClasse: dto.idClasse, isDelete: 0 }'
);
content = content.replace(
  /where: \{ ID: dto\.idAdmin \}/g,
  'where: { ID: dto.idAdmin, isDelete: 0 }'
);

// Fix findAllSalles
content = content.replace(
  /return this\.salleRepository\.find\(\{\n\s*relations: \['classe', 'classe\.cycle'\],/g,
  "return this.salleRepository.find({\n      where: { isDelete: 0 },\n      relations: ['classe', 'classe.cycle'],"
);

// Fix findSalleById
content = content.replace(
  /where: \{ idSalle \},/g,
  'where: { idSalle, isDelete: 0 },'
);

// Fix createAnnee
content = content.replace(
  /where: \{ libelle: dto\.libelle \}/g,
  'where: { libelle: dto.libelle, isDelete: 0 }'
);

// Fix findAllAnnees
content = content.replace(
  /return this\.anneeRepository\.find\(\{ order: \{ libelle: 'DESC' \} \}\);/g,
  "return this.anneeRepository.find({ where: { isDelete: 0 }, order: { libelle: 'DESC' } });"
);

// Fix findAnneeById
content = content.replace(
  /where: \{ idAnnee \}/g,
  'where: { idAnnee, isDelete: 0 }'
);

content = content.replace(
  /where: \{ idCycle: dto\.idCycle \}/g,
  'where: { idCycle: dto.idCycle, isDelete: 0 }'
);

// findClasseById
content = content.replace(
  /where: \{ idClasse \}/g,
  'where: { idClasse, isDelete: 0 }'
);

// findAllClasses
content = content.replace(
  /return this\.classeRepository\.find\(\{\n\s*relations: \['cycle'\],/g,
  "return this.classeRepository.find({\n      where: { isDelete: 0 },\n      relations: ['cycle'],"
);

fs.writeFileSync(file, content);
console.log('done');
