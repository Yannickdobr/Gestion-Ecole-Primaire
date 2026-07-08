const fs = require('fs');
let file = 'src/cours/cours.service.ts';
let content = fs.readFileSync(file, 'utf8');

const oldCreateCours = `  async createCours(dto: CreateCoursDto): Promise<Cours> {
    const classe = await this.classeRepository.findOne({
      where: { idClasse: dto.idClasse },
    });
    if (!classe) throw new NotFoundException(\`Classe introuvable (id: \${dto.idClasse})\`);

    const exists = await this.coursRepository.findOne({
      where: { libelle: dto.libelle, classe: { idClasse: dto.idClasse } },
    });
    if (exists) throw new ConflictException(\`Le cours "\${dto.libelle}" existe déjà dans cette classe\`);

    const cours = this.coursRepository.create({
      libelle: dto.libelle,
      note: dto.note,
      coefficient: dto.coefficient ?? 1.0,
      description: dto.description,
      actif: 1,
      classe,
    });`;

const newCreateCours = `  async createCours(dto: CreateCoursDto): Promise<Cours> {
    const exists = await this.coursRepository.findOne({
      where: { libelle: dto.libelle, isDelete: 0 },
    });
    if (exists) throw new ConflictException(\`Le cours "\${dto.libelle}" existe déjà\`);

    const cours = this.coursRepository.create({
      libelle: dto.libelle,
      note: dto.note,
      coefficient: dto.coefficient ?? 1.0,
      description: dto.description,
      actif: 1,
    });`;

content = content.replace(oldCreateCours, newCreateCours);

const oldFindAllCours = `  async findAllCours(): Promise<Cours[]> {
    return this.coursRepository.find({
      relations: ['classe', 'classe.cycle'],
      order: { libelle: 'ASC' },
    });
  }`;
const newFindAllCours = `  async findAllCours(): Promise<Cours[]> {
    return this.coursRepository.find({
      where: { isDelete: 0 },
      order: { libelle: 'ASC' },
    });
  }`;
content = content.replace(oldFindAllCours, newFindAllCours);

const oldFindCoursByClasse = `  async findCoursByClasse(idClasse: number): Promise<Cours[]> {
    return this.coursRepository.find({
      where: { classe: { idClasse }, actif: 1 },
      relations: ['classe', 'classe.cycle'],
      order: { libelle: 'ASC' },
    });
  }`;
const newFindCoursByClasse = `  async findCoursByClasse(idClasse: number): Promise<Cours[]> {
    // Dans ce MCD, Cours n'est pas directement lié à Classe.
    return this.coursRepository.find({
      where: { actif: 1, isDelete: 0 },
      order: { libelle: 'ASC' },
    });
  }`;
content = content.replace(oldFindCoursByClasse, newFindCoursByClasse);

const oldFindCoursById = `  async findCoursById(idCours: number): Promise<Cours> {
    const cours = await this.coursRepository.findOne({
      where: { idCours },
      relations: ['classe', 'classe.cycle'],
    });`;
const newFindCoursById = `  async findCoursById(idCours: number): Promise<Cours> {
    const cours = await this.coursRepository.findOne({
      where: { idCours, isDelete: 0 },
    });`;
content = content.replace(oldFindCoursById, newFindCoursById);

const oldUpdateCours = `    if (dto.idClasse !== undefined) {
      const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
      if (!classe) throw new NotFoundException(\`Classe introuvable (id: \${dto.idClasse})\`);
      cours.classe = classe;
    }`;
content = content.replace(oldUpdateCours, '');

fs.writeFileSync(file, content);
console.log('done');
