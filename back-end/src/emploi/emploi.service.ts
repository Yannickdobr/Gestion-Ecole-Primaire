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
import { Enseignant } from '../entities/enseignant.entity';
import { Titulaire } from '../entities/titulaire.entity';
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

    @InjectRepository(Enseignant)
    private enseignantRepository: Repository<Enseignant>,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // PLAN D'INTÉRIM (dérivé — aucune donnée stockée en plus)
  //
  // Un enseignant A (titulaire de sa classe) n'assure pas sa « matière de
  // difficulté » (enseignant.idCours). Pour chaque créneau où sa classe
  // programme cette matière, on cherche AUTOMATIQUEMENT un partenaire B libre
  // à la même heure, et on propose un ÉCHANGE réciproque :
  //   - B assure la matière de A dans la classe de A,
  //   - A assure, à la même heure, la matière de B dans la classe de B.
  // Tout est calculé à la volée à partir de l'emploi + de la table Enseignant.
  // ══════════════════════════════════════════════════════════════════════════
  async planInterim(): Promise<any[]> {
    const [creneaux, enseignants, titulaires] = await Promise.all([
      this.emploiRepository.find({
          where: { isDelete: 0 },
        relations: ['classe', 'cours'] }),
      this.enseignantRepository.find({ where: { actif: 1,
          isDelete: 0
    }, relations: ['personne', 'cours'] }),
      // La classe d'un enseignant vient du titulariat : idPers -> salle -> classe
      this.enseignantRepository.manager.find(Titulaire, {
        where: { actif: 1, isDelete: 0 },
        relations: ['personne', 'salle', 'salle.classe'],
      }),
    ]);

    // idPers -> idClasse (via le titulariat)
    const classeParPers = new Map<number, number>();
    for (const t of titulaires) {
      const idp = t.personne?.idPers;
      const idc = t.salle?.classe?.idClasse;
      if (idp != null && idc != null) classeParPers.set(Number(idp), Number(idc));
    }

    // classe → enseignant (le titulaire de cette classe)
    const profParClasse = new Map<number, Enseignant>();
    for (const e of enseignants) {
      const idp = e.personne?.idPers;
      const idc = idp != null ? classeParPers.get(Number(idp)) : null;
      if (idc != null && !profParClasse.has(idc)) profParClasse.set(idc, e);
    }
    const difficulteDe = (e?: Enseignant) => (e?.cours?.idCours != null ? Number(e.cours.idCours) : null);
    const info = (e?: Enseignant) => e ? { idEnseignant: e.idEnseignant, idPers: e.personne?.idPers, nom: e.personne?.nom, prenom: e.personne?.prenom } : null;

    const plan: any[] = [];
    for (const c of creneaux) {
      const idClasseA = Number(c.classe?.idClasse);
      const A = profParClasse.get(idClasseA);
      const DA = difficulteDe(A);
      // Créneau « à problème » : la matière programmée = la matière de difficulté du titulaire
      if (A == null || DA == null || Number(c.cours?.idCours) !== DA) continue;

      // 1. Recherche d'un enseignant totalement libre (qui n'a pas cours à cette heure)
      let freeE: Enseignant | null = null;
      for (const e of enseignants) {
        if (Number(e.idEnseignant) === Number(A.idEnseignant)) continue;
        
        // E peut-il enseigner cette matière ?
        const DE = difficulteDe(e);
        if (DE != null && DE === DA) continue;
        
        // E est-il occupé ? (i.e. titulaire d'une classe qui a cours en ce moment)
        let occupe = false;
        for (const c2 of creneaux) {
          if (c2.jour === c.jour && c2.heure === c.heure) {
            const idC2 = Number(c2.classe?.idClasse);
            const prof2 = profParClasse.get(idC2);
            if (prof2 && Number(prof2.idEnseignant) === Number(e.idEnseignant)) {
              occupe = true;
              break;
            }
          }
        }
        
        if (!occupe) {
          freeE = e;
          break;
        }
      }

      if (freeE) {
        plan.push({
          jour: c.jour,
          heure: c.heure,
          classeConcernee: { idClasse: idClasseA, libelle: c.classe?.libelle },
          matiereDifficulte: { idCours: DA, libelle: c.cours?.libelle },
          enseignantEnDifficulte: info(A),
          interimaire: info(freeE),
          classeInterimaire: null, // Pas d'échange
          matiereContrepartie: null, // Pas d'échange
          conflit: false,
        });
        continue;
      }

      // 2. Recherche automatique d'un partenaire B libre/compatible à la même heure (Échange)
      let match: { B: Enseignant; cB: EmploiDuTemps; X: number } | null = null;
      for (const c2 of creneaux) {
        if (c2.idTemps === c.idTemps) continue;
        if (c2.jour !== c.jour || c2.heure !== c.heure) continue;
        const idClasseB = Number(c2.classe?.idClasse);
        if (idClasseB === idClasseA) continue;
        const B = profParClasse.get(idClasseB);
        if (!B || Number(B.idEnseignant) === Number(A.idEnseignant)) continue;
        const X = Number(c2.cours?.idCours);
        const DB = difficulteDe(B);
        if (X === DA) continue;             // A doit pouvoir enseigner X
        if (DB != null && DA === DB) continue; // B doit pouvoir enseigner DA
        if (DB != null && X === DB) continue;  // X ne doit pas être la difficulté de B (sinon B ne l'assure pas)
        match = { B, cB: c2, X };
        break;
      }

      plan.push({
        jour: c.jour,
        heure: c.heure,
        classeConcernee: { idClasse: idClasseA, libelle: c.classe?.libelle },
        matiereDifficulte: { idCours: DA, libelle: c.cours?.libelle },
        enseignantEnDifficulte: info(A),
        interimaire: match ? info(match.B) : null,
        classeInterimaire: match ? { idClasse: Number(match.cB.classe?.idClasse), libelle: match.cB.classe?.libelle } : null,
        matiereContrepartie: match ? { idCours: match.X, libelle: match.cB.cours?.libelle } : null,
        conflit: !match, // aucun intérimaire compatible à cette heure
      });
    }
    return plan;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ENRICHISSEMENT INTERIM POUR L'EMPLOI DU TEMPS
  // ══════════════════════════════════════════════════════════════════════════
  async enrichirAvecInterim(creneaux: EmploiDuTemps[]): Promise<any[]> {
    if (!creneaux || creneaux.length === 0) return [];

    const planGlobal = await this.planInterim();
    
    // Pour trouver le titulaire de chaque classe
    const titulaires = await this.enseignantRepository.manager.find(Titulaire, {
      where: { actif: 1, isDelete: 0 },
      relations: ['personne', 'salle', 'salle.classe'],
    });

    const profParClasse = new Map<number, any>();
    for (const t of titulaires) {
      if (t.salle?.classe?.idClasse && t.personne) {
        profParClasse.set(Number(t.salle.classe.idClasse), {
          idEnseignant: t.personne.idPers, // idPers ou idEnseignant ? On renvoie nom/prenom surtout
          idPers: t.personne.idPers,
          nom: t.personne.nom,
          prenom: t.personne.prenom,
        });
      }
    }

    return creneaux.map(c => {
      const idClasse = Number(c.classe?.idClasse);
      const res: any = { ...c };

      const titulaire = profParClasse.get(idClasse);
      res.enseignantEffectif = titulaire || null;
      res.coursEffectif = c.cours;
      res.estInterim = false;
      res.aCouvrir = false; // matière de difficulté du titulaire sans intérimaire libre

      // Chercher si ce créneau est modifié par le plan d'intérim
      const swap = planGlobal.find(p => p.jour === c.jour && p.heure === c.heure && !p.conflit &&
        (p.classeConcernee.idClasse === idClasse || p.classeInterimaire?.idClasse === idClasse)
      );

      if (swap) {
        if (swap.classeConcernee.idClasse === idClasse) {
          // La classe A reçoit l'intérimaire B au lieu du titulaire A
          res.enseignantEffectif = swap.interimaire;
          res.estInterim = true;
        } else if (swap.classeInterimaire?.idClasse === idClasse) {
          // La classe B (celle de l'intérimaire) reçoit le titulaire A, avec la matière de contrepartie
          res.enseignantEffectif = swap.enseignantEnDifficulte;
          res.coursEffectif = swap.matiereContrepartie; // objet { idCours, libelle }
          res.estInterim = true;
        }
      } else {
        // Cas CONFLIT : ce créneau programme la matière de difficulté du titulaire
        // mais aucun intérimaire n'est libre. On le signale (comme dans la vue
        // enseignant : « à couvrir — aucun intérimaire libre ») au lieu de
        // l'afficher comme un cours normal assuré par le titulaire.
        const conflit = planGlobal.find(p =>
          p.jour === c.jour && p.heure === c.heure && p.conflit &&
          p.classeConcernee.idClasse === idClasse,
        );
        if (conflit) res.aCouvrir = true;
      }
      return res;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // JOURS DE SEMAINE
  // ══════════════════════════════════════════════════════════════════════════

  async createJour(dto: CreateJourSemaineDto): Promise<JourSemaine> {
    const exists = await this.jourRepository.findOne({ where: { libelle: dto.libelle,
        isDelete: 0
    } });
    if (exists) throw new ConflictException(`Le jour "${dto.libelle}" existe déjà`);
    const jour = this.jourRepository.create({ libelle: dto.libelle });
    return this.jourRepository.save(jour);
  }

  async findAllJours(): Promise<JourSemaine[]> {
    return this.jourRepository.find({
        where: { isDelete: 0 },
        order: { ID: 'ASC' } });
  }

  async findJourById(ID: number): Promise<JourSemaine> {
    const jour = await this.jourRepository.findOne({ where: { ID,
        isDelete: 0
    } });
    if (!jour) throw new NotFoundException(`Jour introuvable (id: ${ID})`);
    return jour;
  }

  async updateJour(ID: number, dto: UpdateJourSemaineDto): Promise<JourSemaine> {
    const jour = await this.findJourById(ID);
    if (dto.libelle !== undefined) jour.libelle = dto.libelle;
    return this.jourRepository.save(jour);
  }

  async removeJour(ID: number, force: boolean = false): Promise<{ message: string }> {
    const jour = await this.findJourById(ID);
    await this.jourRepository.remove(jour);
    return { message: `Jour "${jour.libelle}" supprimé` };
  }

  async seedJours(): Promise<{ message: string }> {
    const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (const libelle of jours) {
      const exists = await this.jourRepository.findOne({ where: { libelle,
          isDelete: 0
    } });
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
    const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse,
        isDelete: 0
    } });
    if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);

    const cours = await this.coursRepository.findOne({
      where: { idCours: dto.idCours,
          isDelete: 0
    },
    });
    if (!cours) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);

    // ── Conflit 1 : même classe + même jour + même heure ───────────────────
    const conflitClasse = await this.emploiRepository.findOne({
      where: {
        classe: { idClasse: dto.idClasse },
        jour: dto.jour,
        heure: dto.heure,
          isDelete: 0
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
          isDelete: 0
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
      const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin,
          isDelete: 0
    } });
      if (admin) creneau.admin = admin;
    }

    return this.emploiRepository.save(creneau);
  }

  async findByClasse(idClasse: number): Promise<EmploiDuTemps[]> {
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
      where: { classe: { idClasse },
          isDelete: 0
    },
      relations: ['cours', 'classe'],
      order: { heure: 'ASC' },
    });

    // Tri métier en mémoire sur l'ordre logique des jours
    const sorted = creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
    
    return this.enrichirAvecInterim(sorted);
  }

  async findByCours(idCours: number): Promise<EmploiDuTemps[]> {
    // CORRECTION erreur 2/3 : order: { jour: 'ASC' } retiré — TypeORM génère
    // une erreur de type quand on mélange order() et relations sur une colonne varchar
    // dans certaines versions. Le tri est fait en mémoire pour garantir l'ordre logique.
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
      where: { cours: { idCours },
          isDelete: 0
    },
      relations: ['classe', 'cours'],
      order: { heure: 'ASC' },
    });

    const sorted = creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
    
    return this.enrichirAvecInterim(sorted);
  }

  async findByJour(jour: string): Promise<EmploiDuTemps[]> {
    const creneaux = await this.emploiRepository.find({
      where: { jour,
          isDelete: 0
    },
      relations: ['classe', 'cours'],
      order: { heure: 'ASC' },
    });
    return this.enrichirAvecInterim(creneaux);
  }

  async findAll(): Promise<EmploiDuTemps[]> {
    // CORRECTION erreur 3/3 : order: { jour: 'ASC' } retiré — même raison.
    // Tri en mémoire pour respecter l'ordre logique Lundi → Samedi.
    const ordreJours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    const creneaux = await this.emploiRepository.find({
        where: { isDelete: 0 },
        relations: ['classe', 'cours', 'classe.cycle'],
      order: { heure: 'ASC' },
    });

    const sorted = creneaux.sort((a, b) => {
      const indexA = ordreJours.indexOf(a.jour);
      const indexB = ordreJours.indexOf(b.jour);
      if (indexA !== indexB) return indexA - indexB;
      return a.heure.localeCompare(b.heure);
    });
    
    return this.enrichirAvecInterim(sorted);
  }

  async findCreneauById(idTemps: number): Promise<EmploiDuTemps> {
    const c = await this.emploiRepository.findOne({
      where: { idTemps,
          isDelete: 0
    },
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
      const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse,
          isDelete: 0
    } });
      if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);
      creneau.classe = classe;
    }

    if (dto.idCours !== undefined) {
      const cours = await this.coursRepository.findOne({ where: { idCours: dto.idCours,
          isDelete: 0
    } });
      if (!cours) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);
      creneau.cours = cours;
    }

    return this.emploiRepository.save(creneau);
  }

  async removeCreneau(idTemps: number, force: boolean = false): Promise<{ message: string }> {
    const creneau = await this.findCreneauById(idTemps);
    creneau.isDelete = 1;
    await this.emploiRepository.save(creneau);
    return { message: `Créneau id ${idTemps} supprimé` };
  }

  async removeAllByClasse(idClasse: number): Promise<{ message: string }> {
    const creneaux = await this.emploiRepository.find({
      where: { classe: { idClasse },
          isDelete: 0
    },
    });
    creneaux.forEach(c => c.isDelete = 1);
    await this.emploiRepository.save(creneaux);
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
          isDelete: 0
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
          isDelete: 0
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