import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cours } from '../entities/cours.entity';
import { Discipline } from '../entities/discipline.entity';
import { Specialite } from '../entities/specialite.entity';
import { Livres } from '../entities/livres.entity';
import { Classe } from '../entities/classe.entity';
import { Admin } from '../entities/admin.entity';
import { EmploiDuTemps } from '../entities/emploi-du-temps.entity';
import { Enseignant } from '../entities/enseignant.entity';
import { Evaluation } from '../entities/evaluation.entity';
import { verifierAvantSuppression } from '../common/referential-integrity';
import {
  CreateCoursDto, UpdateCoursDto,
  CreateDisciplineDto, UpdateDisciplineDto,
  CreateSpecialiteDto, UpdateSpecialiteDto,
  CreateLivreDto, UpdateLivreDto,
} from './dto/cours.dto';

@Injectable()
export class CoursService {
  constructor(
    @InjectRepository(Cours)
    private coursRepository: Repository<Cours>,

    @InjectRepository(Discipline)
    private disciplineRepository: Repository<Discipline>,

    @InjectRepository(Specialite)
    private specialiteRepository: Repository<Specialite>,

    @InjectRepository(Livres)
    private livresRepository: Repository<Livres>,

    @InjectRepository(Classe)
    private classeRepository: Repository<Classe>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // COURS
  // ══════════════════════════════════════════════════════════════════════════

  async createCours(dto: CreateCoursDto): Promise<Cours> {
    const exists = await this.coursRepository.findOne({
      where: { libelle: dto.libelle, isDelete: 0 },
    });
    if (exists) throw new ConflictException(`Le cours "${dto.libelle}" existe déjà`);

    const cours = this.coursRepository.create({
      libelle: dto.libelle,
      note: dto.note,
      coefficient: dto.coefficient ?? 1.0,
      description: dto.description,
      actif: 1,
    });

    if (dto.idLivre) {
      const livre = await this.livresRepository.findOne({ where: { idLivre: dto.idLivre } });
      if (!livre) throw new NotFoundException(`Livre introuvable (id: ${dto.idLivre})`);
      cours.livre = livre;
    }

    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
      if (admin) cours.admin = admin;
    }

    return this.coursRepository.save(cours);
  }

  async findAllCours(): Promise<Cours[]> {
    return this.coursRepository.find({
      where: { isDelete: 0 },
      order: { libelle: 'ASC' },
    });
  }

  async findCoursByClasse(idClasse: number): Promise<Cours[]> {
    // Dans ce MCD, Cours n'est pas directement lié à Classe.
    return this.coursRepository.find({
      where: { actif: 1, isDelete: 0 },
      order: { libelle: 'ASC' },
    });
  }

  async findCoursById(idCours: number): Promise<Cours> {
    const cours = await this.coursRepository.findOne({
      where: { idCours, isDelete: 0 },
    });
    if (!cours) throw new NotFoundException(`Cours introuvable (id: ${idCours})`);
    return cours;
  }

  async updateCours(idCours: number, dto: UpdateCoursDto): Promise<Cours> {
    const cours = await this.findCoursById(idCours);

    if (dto.libelle !== undefined) cours.libelle = dto.libelle;
    if (dto.note !== undefined) cours.note = dto.note;
    if (dto.coefficient !== undefined) cours.coefficient = dto.coefficient;
    if (dto.description !== undefined) cours.description = dto.description;
    if (dto.actif !== undefined) cours.actif = dto.actif;

    // no-op for idClasse as it's not in Cours entity

    if (dto.idLivre !== undefined) {
      if (dto.idLivre === null) {
        cours.livre = null;
      } else {
        const livre = await this.livresRepository.findOne({ where: { idLivre: dto.idLivre } });
        if (!livre) throw new NotFoundException(`Livre introuvable (id: ${dto.idLivre})`);
        cours.livre = livre;
      }
    }

    return this.coursRepository.save(cours);
  }

  async desactiverCours(idCours: number): Promise<{ message: string }> {
    const cours = await this.findCoursById(idCours);
    cours.actif = 0;
    await this.coursRepository.save(cours);
    return { message: `Cours "${cours.libelle}" désactivé` };
  }

  async removeCours(idCours: number, force: boolean = false): Promise<{ message: string }> {
    const cours = await this.findCoursById(idCours);
    await verifierAvantSuppression(
      this.coursRepository.manager,
      `le cours "${cours.libelle}"`,
      [
        { entity: EmploiDuTemps, where: { cours: { idCours } }, label: (n) => `${n} créneau(x) d'emploi du temps` },
        { entity: Enseignant, where: { cours: { idCours } }, label: (n) => `${n} enseignant(s)` },
        { entity: Evaluation, where: { cours: { idCours } }, label: (n) => `${n} note(s)` },
      ],
      force,
      'Désactivez-le plutôt pour conserver l\'historique.',
    );
    cours.isDelete = 1;
    await this.coursRepository.save(cours);
    return { message: `Cours "${cours.libelle}" supprimé` };
  }

  async searchCours(query: string): Promise<Cours[]> {
    return this.coursRepository
      .createQueryBuilder('cours')
      .leftJoinAndSelect('cours.livre', 'livre')
      .where('cours.libelle LIKE :q', { q: `%${query}%` })
      .andWhere('cours.isDelete = 0')
      .orderBy('cours.libelle', 'ASC')
      .getMany();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DISCIPLINES
  // ══════════════════════════════════════════════════════════════════════════

  async createDiscipline(dto: CreateDisciplineDto): Promise<Discipline> {
    const exists = await this.disciplineRepository.findOne({
      where: { libelle: dto.libelle, isDelete: 0 },
    });
    if (exists) throw new ConflictException(`La discipline "${dto.libelle}" existe déjà`);

    const discipline = this.disciplineRepository.create({
      libelle: dto.libelle,
      points: dto.points,
    });
    return this.disciplineRepository.save(discipline);
  }

  async findAllDisciplines(): Promise<Discipline[]> {
    return this.disciplineRepository.find({ where: { isDelete: 0 }, order: { libelle: 'ASC' } });
  }

  async findDisciplineById(ID: number): Promise<Discipline> {
    const discipline = await this.disciplineRepository.findOne({ where: { ID, isDelete: 0 } });
    if (!discipline) throw new NotFoundException(`Discipline introuvable (id: ${ID})`);
    return discipline;
  }

  async updateDiscipline(ID: number, dto: UpdateDisciplineDto): Promise<Discipline> {
    const discipline = await this.findDisciplineById(ID);
    if (dto.libelle !== undefined) discipline.libelle = dto.libelle;
    if (dto.points !== undefined) discipline.points = dto.points;
    return this.disciplineRepository.save(discipline);
  }

  async removeDiscipline(ID: number, force: boolean = false): Promise<{ message: string }> {
    const discipline = await this.findDisciplineById(ID);
    discipline.isDelete = 1;
    await this.disciplineRepository.save(discipline);
    return { message: `Discipline "${discipline.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SPÉCIALITÉS
  // ══════════════════════════════════════════════════════════════════════════

  async createSpecialite(dto: CreateSpecialiteDto): Promise<Specialite> {
    const exists = await this.specialiteRepository.findOne({
      where: { libelle: dto.libelle, isDelete: 0 },
    });
    if (exists) throw new ConflictException(`La spécialité "${dto.libelle}" existe déjà`);

    // CORRECTION erreur 1/3 : idParent retiré — colonne absente de la table Specialite en BD
    // La BD ne contient que : idSpecialite, libelle, idAdmin
    const specialite = this.specialiteRepository.create({
      libelle: dto.libelle,
    });

    // idAdmin NOT NULL : admin fourni, sinon repli sur l'admin racine
    specialite.admin = await this.resoudreAdmin(dto.idAdmin);
    return this.specialiteRepository.save(specialite);
  }

  /** Admin fourni, sinon repli sur l'admin racine (idAdmin NOT NULL en BD). */
  private async resoudreAdmin(idAdmin?: number): Promise<Admin> {
    if (idAdmin) {
      const a = await this.adminRepository.findOne({ where: { ID: idAdmin } });
      if (a) return a;
    }
    const premier = await this.adminRepository.find({ order: { ID: 'ASC' }, take: 1 });
    return premier[0];
  }

  async findAllSpecialites(): Promise<Specialite[]> {
    return this.specialiteRepository.find({ where: { isDelete: 0 }, order: { libelle: 'ASC' } });
  }

  async findSpecialiteById(idSpecialite: number): Promise<Specialite> {
    const spe = await this.specialiteRepository.findOne({
      where: { idSpecialite, isDelete: 0 },
      relations: ['livres'],
    });
    if (!spe) throw new NotFoundException(`Spécialité introuvable (id: ${idSpecialite})`);
    return spe;
  }

  async updateSpecialite(idSpecialite: number, dto: UpdateSpecialiteDto): Promise<Specialite> {
    const spe = await this.findSpecialiteById(idSpecialite);
    // CORRECTION erreur 2/3 : spe.idParent retiré — propriété inexistante sur l'entité Specialite
    if (dto.libelle !== undefined) spe.libelle = dto.libelle;
    return this.specialiteRepository.save(spe);
  }

  async removeSpecialite(idSpecialite: number, force: boolean = false): Promise<{ message: string }> {
    const spe = await this.findSpecialiteById(idSpecialite);
    await verifierAvantSuppression(
      this.specialiteRepository.manager,
      `la spécialité "${spe.libelle}"`,
      [{ entity: Livres, where: { specialite: { idSpecialite } }, label: (n) => `${n} livre(s)` }],
      force
    );
    spe.isDelete = 1;
    await this.specialiteRepository.save(spe);
    return { message: `Spécialité "${spe.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIVRES
  // ══════════════════════════════════════════════════════════════════════════

  async createLivre(dto: CreateLivreDto): Promise<Livres> {
    // CORRECTION erreur 3/3 : annee_parution est de type Date dans l'entité.
    // new Date(undefined) produisait une date invalide. On passe par une variable
    // intermédiaire typée correctement avant d'affecter la valeur.
    const anneeParution: Date | undefined = dto.annee_parution
      ? new Date(dto.annee_parution)
      : undefined;

    const livre = this.livresRepository.create({
      titre: dto.titre,
      auteurs: dto.auteurs,
      prix: dto.prix,
      edition: dto.edition,
      annee_parution: anneeParution,
      totalCopie: dto.totalCopie ?? 1,
    });

    // specialite est NOT NULL en BD : celle fournie, sinon la première existante,
    // sinon on crée une spécialité « Général » par défaut.
    let spe: Specialite | null = null;
    if (dto.idSpecialite) {
      spe = await this.specialiteRepository.findOne({ where: { idSpecialite: dto.idSpecialite } });
      if (!spe) throw new NotFoundException(`Spécialité introuvable (id: ${dto.idSpecialite})`);
    } else {
      spe = (await this.specialiteRepository.find({ order: { idSpecialite: 'ASC' }, take: 1 }))[0] ?? null;
      if (!spe) {
        spe = await this.specialiteRepository.save(
          this.specialiteRepository.create({ libelle: 'Général', admin: await this.resoudreAdmin(dto.idAdmin) }),
        );
      }
    }
    livre.specialite = spe;

    // idAdmin NOT NULL : admin fourni, sinon repli sur l'admin racine
    livre.admin = await this.resoudreAdmin(dto.idAdmin);

    return this.livresRepository.save(livre);
  }

  async findAllLivres(): Promise<Livres[]> {
    return this.livresRepository.find({
      where: { isDelete: 0 },
      relations: ['specialite'],
      order: { titre: 'ASC' },
    });
  }

  async findLivresBySpecialite(idSpecialite: number): Promise<Livres[]> {
    return this.livresRepository.find({
      where: { specialite: { idSpecialite }, isDelete: 0 },
      relations: ['specialite'],
      order: { titre: 'ASC' },
    });
  }

  async findLivreById(idLivre: number): Promise<Livres> {
    const livre = await this.livresRepository.findOne({
      where: { idLivre, isDelete: 0 },
      relations: ['specialite'],
    });
    if (!livre) throw new NotFoundException(`Livre introuvable (id: ${idLivre})`);
    return livre;
  }

  async updateLivre(idLivre: number, dto: UpdateLivreDto): Promise<Livres> {
    const livre = await this.findLivreById(idLivre);

    if (dto.titre !== undefined) livre.titre = dto.titre;
    if (dto.auteurs !== undefined) livre.auteurs = dto.auteurs;
    if (dto.prix !== undefined) livre.prix = dto.prix;
    if (dto.edition !== undefined) livre.edition = dto.edition;
    // CORRECTION erreur 3/3 (suite) : même traitement dans updateLivre
    if (dto.annee_parution !== undefined) livre.annee_parution = new Date(dto.annee_parution);
    if (dto.totalCopie !== undefined) livre.totalCopie = dto.totalCopie;

    if (dto.idSpecialite !== undefined) {
      const spe = await this.specialiteRepository.findOne({
        where: { idSpecialite: dto.idSpecialite },
      });
      if (!spe) throw new NotFoundException(`Spécialité introuvable (id: ${dto.idSpecialite})`);
      livre.specialite = spe;
    }

    return this.livresRepository.save(livre);
  }

  async removeLivre(idLivre: number, force: boolean = false): Promise<{ message: string }> {
    const livre = await this.findLivreById(idLivre);
    livre.isDelete = 1; // suppression logique (cohérent avec le reste)
    await this.livresRepository.save(livre);
    return { message: `Livre "${livre.titre}" supprimé` };
  }

  async searchLivres(query: string): Promise<Livres[]> {
    return this.livresRepository
      .createQueryBuilder('livre')
      .leftJoinAndSelect('livre.specialite', 'specialite')
      .where('(livre.titre LIKE :q OR livre.auteurs LIKE :q)', { q: `%${query}%` })
      .andWhere('livre.isDelete = 0')
      .orderBy('livre.titre', 'ASC')
      .getMany();
  }
}