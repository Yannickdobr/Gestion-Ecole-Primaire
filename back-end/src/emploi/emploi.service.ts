import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmploiDuTemps } from '../entities/emploi-du-temps.entity';
import { JourSemaine } from '../entities/jour-semaine.entity';
import { Classe } from '../entities/classe.entity';
import { Cours } from '../entities/cours.entity';
import { Admin } from '../entities/admin.entity';
import {
  CreateEmploiDuTempsDto,
  UpdateEmploiDuTempsDto,
  CreateJourSemaineDto,
  UpdateJourSemaineDto,
} from './dto/emploi.dto';

@Injectable()
export class EmploiService {
  constructor(
    @InjectRepository(EmploiDuTemps)
    private emploiRepository: Repository<EmploiDuTemps>,

    @InjectRepository(JourSemaine)
    private jourRepository: Repository<JourSemaine>,

    @InjectRepository(Classe)
    private classeRepository: Repository<Classe>,

    @InjectRepository(Cours)
    private coursRepository: Repository<Cours>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // JOURS DE SEMAINE
  // ══════════════════════════════════════════════════════════════════════════

  async createJour(dto: CreateJourSemaineDto): Promise<JourSemaine> {
    const exists = await this.jourRepository.findOne({ where: { libelle: dto.libelle } });
    if (exists) throw new ConflictException(`Le jour "${dto.libelle}" existe déjà`);
    const jour = this.jourRepository.create({ libelle: dto.libelle });
    return this.jourRepository.save(jour);
  }

  async findAllJours(): Promise<JourSemaine[]> {
    return this.jourRepository.find({ order: { ID: 'ASC' } });
  }

  async findJourById(ID: number): Promise<JourSemaine> {
    const jour = await this.jourRepository.findOne({ where: { ID } });
    if (!jour) throw new NotFoundException(`Jour introuvable (id: ${ID})`);
    return jour;
  }

  async updateJour(ID: number, dto: UpdateJourSemaineDto): Promise<JourSemaine> {
    const jour = await this.findJourById(ID);
    if (dto.libelle !== undefined) jour.libelle = dto.libelle;
    return this.jourRepository.save(jour);
  }

  async removeJour(ID: number): Promise<{ message: string }> {
    const jour = await this.findJourById(ID);
    await this.jourRepository.remove(jour);
    return { message: `Jour "${jour.libelle}" supprimé` };
  }

  async seedJours(): Promise<{ message: string }> {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (const libelle of jours) {
      const exists = await this.jourRepository.findOne({ where: { libelle } });
      if (!exists) {
        await this.jourRepository.save(this.jourRepository.create({ libelle }));
      }
    }
    return { message: 'Jours de la semaine initialisés avec succès' };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EMPLOIS DU TEMPS
  // ══════════════════════════════════════════════════════════════════════════

  async createCreneau(dto: CreateEmploiDuTempsDto): Promise<EmploiDuTemps> {
    const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
    if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);

    const cours = await this.coursRepository.findOne({
      where: { idCours: dto.idCours },
      relations: ['classe'],
    });
    if (!cours) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);

    // ── Conflit 1 : même classe + même jour + même heure ───────────────────
    const conflitClasse = await this.emploiRepository.findOne({
      where: {
        classe: { idClasse: dto.idClasse },
        jour: dto.jour,
        heure: dto.heure,
      },
    });
    if (conflitClasse) {
      throw new ConflictException(
        `Conflit détecté : la classe "${classe.libelle}" a déjà un cours le ${dto.jour} à ${dto.heure}`,
      );
    }

    // ── Conflit 2 : même cours + même jour + même heure ────────────────────
    const conflitCours = await this.emploiRepository.findOne({
      where: {
        cours: { idCours: dto.idCours },
        jour: dto.jour,
        heure: dto.heure,
      },
    });
    if (conflitCours) {
      throw new ConflictException(
        `Conflit détecté : ce cours est déjà planifié le ${dto.jour} à ${dto.heure} dans une autre classe`,
      );
    }

    // CORRECTION erreur 1/3 : heureFin retiré du create() — colonne absente
    // de la table EmploiDuTemps en BD (seulement : idTemps, jour, heure, idClasse, idCours, idAdmin)
    const creneau = this.emploiRepository.create({
      jour: dto.jour,
      heure: dto.heure,
      classe,
      cours,
    });

    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
      if (admin) creneau.admin = admin;
    }

    return this.emploiRepository.save(creneau);
  }

  async findByClasse(idClasse: number): Promise<EmploiDuTemps[]> {
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
      where: { classe: { idClasse } },
      relations: ['cours', 'cours.classe', 'classe'],
      order: { heure: 'ASC' },
    });

    // Tri métier en mémoire sur l'ordre logique des jours
    return creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
  }

  async findByCours(idCours: number): Promise<EmploiDuTemps[]> {
    // CORRECTION erreur 2/3 : order: { jour: 'ASC' } retiré — TypeORM génère
    // une erreur de type quand on mélange order() et relations sur une colonne varchar
    // dans certaines versions. Le tri est fait en mémoire pour garantir l'ordre logique.
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
      where: { cours: { idCours } },
      relations: ['classe', 'cours'],
      order: { heure: 'ASC' },
    });

    return creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
  }

  async findByJour(jour: string): Promise<EmploiDuTemps[]> {
    return this.emploiRepository.find({
      where: { jour },
      relations: ['classe', 'cours'],
      order: { heure: 'ASC' },
    });
  }

  async findAll(): Promise<EmploiDuTemps[]> {
    // CORRECTION erreur 3/3 : order: { jour: 'ASC' } retiré — même raison.
    // Tri en mémoire pour respecter l'ordre logique Lundi → Samedi.
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
      relations: ['classe', 'cours', 'classe.cycle'],
      order: { heure: 'ASC' },
    });

    return creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
  }

  async findCreneauById(idTemps: number): Promise<EmploiDuTemps> {
    const c = await this.emploiRepository.findOne({
      where: { idTemps },
      relations: ['classe', 'cours', 'admin'],
    });
    if (!c) throw new NotFoundException(`Créneau introuvable (id: ${idTemps})`);
    return c;
  }

  async updateCreneau(idTemps: number, dto: UpdateEmploiDuTempsDto): Promise<EmploiDuTemps> {
    const creneau = await this.findCreneauById(idTemps);

    const newJour = dto.jour ?? creneau.jour;
    const newHeure = dto.heure ?? creneau.heure;
    const newIdClasse = dto.idClasse ?? creneau.classe.idClasse;

    if (dto.jour || dto.heure || dto.idClasse) {
      const conflitClasse = await this.emploiRepository
        .createQueryBuilder('e')
        .where('e.idClasse = :idClasse', { idClasse: newIdClasse })
        .andWhere('e.jour = :jour', { jour: newJour })
        .andWhere('e.heure = :heure', { heure: newHeure })
        .andWhere('e.idTemps != :idTemps', { idTemps })
        .getOne();

      if (conflitClasse) {
        throw new ConflictException(
          `Conflit : cette classe a déjà un cours le ${newJour} à ${newHeure}`,
        );
      }
    }

    if (dto.jour !== undefined) creneau.jour = dto.jour;
    if (dto.heure !== undefined) creneau.heure = dto.heure;
    // CORRECTION : heureFin retiré — propriété absente de l'entité EmploiDuTemps

    if (dto.idClasse !== undefined) {
      const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
      if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);
      creneau.classe = classe;
    }

    if (dto.idCours !== undefined) {
      const cours = await this.coursRepository.findOne({ where: { idCours: dto.idCours } });
      if (!cours) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);
      creneau.cours = cours;
    }

    return this.emploiRepository.save(creneau);
  }

  async removeCreneau(idTemps: number): Promise<{ message: string }> {
    const creneau = await this.findCreneauById(idTemps);
    await this.emploiRepository.remove(creneau);
    return { message: `Créneau id ${idTemps} supprimé` };
  }

  async removeAllByClasse(idClasse: number): Promise<{ message: string }> {
    const creneaux = await this.emploiRepository.find({
      where: { classe: { idClasse } },
    });
    await this.emploiRepository.remove(creneaux);
    return { message: `${creneaux.length} créneau(x) supprimé(s) pour la classe id ${idClasse}` };
  }

  async verifierConflits(dto: CreateEmploiDuTempsDto): Promise<{
    hasConflict: boolean;
    conflicts: string[];
  }> {
    const conflicts: string[] = [];

    const conflitClasse = await this.emploiRepository.findOne({
      where: {
        classe: { idClasse: dto.idClasse },
        jour: dto.jour,
        heure: dto.heure,
      },
      relations: ['cours'],
    });
    if (conflitClasse) {
      conflicts.push(
        `La classe a déjà le cours "${conflitClasse.cours.libelle}" le ${dto.jour} à ${dto.heure}`,
      );
    }

    const conflitCours = await this.emploiRepository.findOne({
      where: {
        cours: { idCours: dto.idCours },
        jour: dto.jour,
        heure: dto.heure,
      },
      relations: ['classe'],
    });
    if (conflitCours) {
      conflicts.push(
        `Ce cours est déjà planifié dans la classe "${conflitCours.classe.libelle}" le ${dto.jour} à ${dto.heure}`,
      );
    }

    return { hasConflict: conflicts.length > 0, conflicts };
  }
}