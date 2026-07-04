import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mode } from '../entities/mode.entity';
import { Scolarite } from '../entities/scolarite.entity';
import { Tranches } from '../entities/tranches.entity';
import { Paiement } from '../entities/paiement.entity';
import { Eleve } from '../entities/eleve.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Cycle } from '../entities/cycle.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';
import { NotificationService } from '../common/notification.service';
import {
  CreateModeDto, UpdateModeDto,
  CreateScolariteDto, UpdateScolariteDto,
  CreateTrancheDto, UpdateTrancheDto,
  CreatePaiementDto, UpdatePaiementDto,
} from './dto/paiements.dto';

@Injectable()
export class PaiementsService {
  constructor(
    @InjectRepository(Mode)
    private modeRepository: Repository<Mode>,

    @InjectRepository(Scolarite)
    private scolariteRepository: Repository<Scolarite>,

    @InjectRepository(Tranches)
    private trancheRepository: Repository<Tranches>,

    @InjectRepository(Paiement)
    private paiementRepository: Repository<Paiement>,

    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,

    @InjectRepository(AnneeAcademique)
    private anneeRepository: Repository<AnneeAcademique>,

    @InjectRepository(Cycle)
    private cycleRepository: Repository<Cycle>,

    @InjectRepository(Personne)
    private personneRepository: Repository<Personne>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    private readonly notifications: NotificationService,
  ) {}

  /**
   * BF-23 — Rappels d'impayés (déclenché manuellement par la scolarité/direction).
   * Parcourt les élèves actifs, calcule leur arriéré pour l'année et notifie
   * (in-app + email) les parents de ceux ayant un solde dû.
   */
  async envoyerRappelsImpayes(idAca: number, expediteurId?: number) {
    const annee = await this.anneeRepository.findOne({ where: { idAnnee: idAca } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${idAca})`);

    const eleves = await this.eleveRepository.find({ where: { actif: 1 } });
    let elevesEnRetard = 0;
    const details: any[] = [];

    for (const el of eleves) {
      let arr: any;
      try {
        arr = await this.calculerArrieres(el.matricule, idAca);
      } catch {
        continue; // élève sans données exploitables cette année
      }
      if (!arr?.scolariteDefinie || Number(arr.arriere) <= 0) continue;

      const montant = Number(arr.arriere);
      const res = await this.notifications.notifierParentsEleve(
        el.matricule,
        'Rappel : scolarité en attente',
        `Bonjour,\nNous vous rappelons qu'un solde de scolarité de ${montant} FCFA reste dû pour votre enfant ` +
          `(matricule ${el.matricule}) au titre de l'année ${annee.libelle}.\n` +
          `Merci de bien vouloir régulariser la situation auprès de la scolarité.`,
        { expediteurId, annee: annee.libelle, type: 2 },
      );
      if (res.inApp > 0 || res.emails > 0) {
        elevesEnRetard++;
        details.push({ matricule: el.matricule, arriere: montant, ...res });
      }
    }
    return { annee: annee.libelle, elevesEnRetard, details };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MODES DE PAIEMENT
  // ══════════════════════════════════════════════════════════════════════════

  async createMode(dto: CreateModeDto): Promise<Mode> {
    const exists = await this.modeRepository.findOne({ where: { libelle: dto.libelle } });
    if (exists) throw new ConflictException(`Le mode "${dto.libelle}" existe déjà`);

    // Valeurs par défaut pour les colonnes NOT NULL non renseignées
    const mode = this.modeRepository.create({
      libelle: dto.libelle,
      information: dto.information ?? 'INDEFINI',
      actif: 1,
      idFondateur: dto.idFondateur ?? 0,
    });
    return this.modeRepository.save(mode);
  }

  async findAllModes(): Promise<Mode[]> {
    return this.modeRepository.find({ where: { actif: 1 }, order: { libelle: 'ASC' } });
  }

  async findModeById(idMode: number): Promise<Mode> {
    const mode = await this.modeRepository.findOne({ where: { idMode } });
    if (!mode) throw new NotFoundException(`Mode de paiement introuvable (id: ${idMode})`);
    return mode;
  }

  async updateMode(idMode: number, dto: UpdateModeDto): Promise<Mode> {
    const mode = await this.findModeById(idMode);
    if (dto.libelle !== undefined) mode.libelle = dto.libelle;
    if (dto.information !== undefined) mode.information = dto.information;
    if (dto.actif !== undefined) mode.actif = dto.actif;
    return this.modeRepository.save(mode);
  }

  async removeMode(idMode: number): Promise<{ message: string }> {
    const mode = await this.findModeById(idMode);
    await this.modeRepository.remove(mode);
    return { message: `Mode "${mode.libelle}" supprimé` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SCOLARITÉS
  // ══════════════════════════════════════════════════════════════════════════

  async createScolarite(dto: CreateScolariteDto): Promise<Scolarite> {
    const cycle = await this.cycleRepository.findOne({ where: { idCycle: dto.idCycle } });
    if (!cycle) throw new NotFoundException(`Cycle introuvable (id: ${dto.idCycle})`);

    const scolarite = this.scolariteRepository.create({
      inscription: dto.inscription,
      pension: dto.pension,
      nbreTranche: dto.nbreTranche ?? 3,
      description: dto.description ?? 'INDEFINI', // NOT NULL en BD
      idFondateur: dto.idFondateur ?? 0, // NOT NULL en BD (colonne sans FK)
      cycle,
    });

    return this.scolariteRepository.save(scolarite);
  }

  async findAllScolarites(): Promise<Scolarite[]> {
    return this.scolariteRepository.find({
      relations: ['cycle', 'tranches'],
      order: { created_at: 'DESC' },
    });
  }

  async findScolariteByCycle(idCycle: number): Promise<Scolarite> {
    const s = await this.scolariteRepository.findOne({
      where: { cycle: { idCycle } },
      relations: ['cycle', 'tranches'],
    });
    if (!s) throw new NotFoundException(`Scolarité non définie pour ce cycle (id: ${idCycle})`);
    return s;
  }

  async findScolariteById(idScolarite: number): Promise<Scolarite> {
    const s = await this.scolariteRepository.findOne({
      where: { idScolarite },
      relations: ['cycle', 'tranches'],
    });
    if (!s) throw new NotFoundException(`Scolarité introuvable (id: ${idScolarite})`);
    return s;
  }

  async updateScolarite(idScolarite: number, dto: UpdateScolariteDto): Promise<Scolarite> {
    const s = await this.findScolariteById(idScolarite);
    if (dto.inscription !== undefined) s.inscription = dto.inscription;
    if (dto.pension !== undefined) s.pension = dto.pension;
    if (dto.nbreTranche !== undefined) s.nbreTranche = dto.nbreTranche;
    if (dto.description !== undefined) s.description = dto.description;
    if (dto.idCycle !== undefined) {
      const cycle = await this.cycleRepository.findOne({ where: { idCycle: dto.idCycle } });
      if (!cycle) throw new NotFoundException(`Cycle introuvable (id: ${dto.idCycle})`);
      s.cycle = cycle;
    }
    return this.scolariteRepository.save(s);
  }

  async removeScolarite(idScolarite: number): Promise<{ message: string }> {
    const s = await this.findScolariteById(idScolarite);
    await this.scolariteRepository.remove(s);
    return { message: `Scolarité id ${idScolarite} supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANCHES
  // ══════════════════════════════════════════════════════════════════════════

  async createTranche(dto: CreateTrancheDto): Promise<Tranches> {
    const scolarite = await this.findScolariteById(dto.idScolarite);

    const tranche = this.trancheRepository.create({
      libelle: dto.libelle,
      montant: dto.montant,
      delai_mois: dto.delai_mois ?? '00', // char(2) NOT NULL
      delai_jour: dto.delai_jour ?? '00', // char(2) NOT NULL
      actif: 1,
      idFondateur: dto.idFondateur ?? 0, // NOT NULL en BD
      scolarite,
    });
    return this.trancheRepository.save(tranche);
  }

  async findTranchesByScolarite(idScolarite: number): Promise<Tranches[]> {
    return this.trancheRepository.find({
      where: { scolarite: { idScolarite } },
      order: { delai_mois: 'ASC' },
    });
  }

  async findTrancheById(idTranche: number): Promise<Tranches> {
    const t = await this.trancheRepository.findOne({
      where: { idTranche },
      relations: ['scolarite'],
    });
    if (!t) throw new NotFoundException(`Tranche introuvable (id: ${idTranche})`);
    return t;
  }

  async updateTranche(idTranche: number, dto: UpdateTrancheDto): Promise<Tranches> {
    const t = await this.findTrancheById(idTranche);
    if (dto.libelle !== undefined) t.libelle = dto.libelle;
    if (dto.montant !== undefined) t.montant = dto.montant;
    if (dto.delai_mois !== undefined) t.delai_mois = dto.delai_mois;
    if (dto.delai_jour !== undefined) t.delai_jour = dto.delai_jour;
    if (dto.actif !== undefined) t.actif = dto.actif;
    return this.trancheRepository.save(t);
  }

  async removeTranche(idTranche: number): Promise<{ message: string }> {
    const t = await this.findTrancheById(idTranche);
    await this.trancheRepository.remove(t);
    return { message: `Tranche "${t.libelle}" supprimée` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAIEMENTS
  // ══════════════════════════════════════════════════════════════════════════

  async enregistrerPaiement(dto: CreatePaiementDto): Promise<Paiement> {
    const eleve = await this.eleveRepository.findOne({ where: { matricule: dto.matricule } });
    if (!eleve) throw new NotFoundException(`Élève introuvable (matricule: ${dto.matricule})`);

    const annee = await this.anneeRepository.findOne({ where: { idAnnee: dto.idAca } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${dto.idAca})`);

    const mode = await this.findModeById(dto.idMode);

    const paiement = this.paiementRepository.create({
      montant: dto.montant,
      datePaie: new Date(dto.datePaie),
      url: dto.url ?? 'INDEFINI', // NOT NULL en BD
      commentaire: dto.commentaire ?? 'INDEFINI',
      operation_ID: dto.operation_ID ?? 'INDEFINI',
      eleve,
      anneeAcademique: annee,
      mode,
    });

    if (dto.idPers) {
      const pers = await this.personneRepository.findOne({ where: { idPers: dto.idPers } });
      if (pers) paiement.enregistrePar = pers;
    }

    return this.paiementRepository.save(paiement);
  }

  async findPaiementsByEleve(matricule: number): Promise<Paiement[]> {
    return this.paiementRepository.find({
      where: { eleve: { matricule } },
      relations: ['mode', 'anneeAcademique'],
      order: { datePaie: 'DESC' },
    });
  }

  async findPaiementsByAnnee(idAca: number): Promise<Paiement[]> {
    return this.paiementRepository.find({
      where: { anneeAcademique: { idAnnee: idAca } },
      relations: ['eleve', 'mode'],
      order: { datePaie: 'DESC' },
    });
  }

  async findPaiementById(idPaie: number): Promise<Paiement> {
    const p = await this.paiementRepository.findOne({
      where: { idPaie },
      relations: ['eleve', 'mode', 'anneeAcademique', 'enregistrePar'],
    });
    if (!p) throw new NotFoundException(`Paiement introuvable (id: ${idPaie})`);
    return p;
  }

  async updatePaiement(idPaie: number, dto: UpdatePaiementDto): Promise<Paiement> {
    const p = await this.findPaiementById(idPaie);
    if (dto.montant !== undefined) p.montant = dto.montant;
    if (dto.datePaie !== undefined) p.datePaie = new Date(dto.datePaie);
    if (dto.url !== undefined) p.url = dto.url;
    if (dto.commentaire !== undefined) p.commentaire = dto.commentaire;
    if (dto.operation_ID !== undefined) p.operation_ID = dto.operation_ID;
    if (dto.idMode !== undefined) p.mode = await this.findModeById(dto.idMode);
    return this.paiementRepository.save(p);
  }

  async removePaiement(idPaie: number): Promise<{ message: string }> {
    const p = await this.findPaiementById(idPaie);
    await this.paiementRepository.remove(p);
    return { message: `Paiement id ${idPaie} supprimé` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CALCUL DES ARRIÉRÉS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Calcule le solde d'un élève pour une année académique :
   * Total dû = inscription + pension
   * Total payé = somme des paiements enregistrés
   * Arriéré = Total dû - Total payé
   */
  async calculerArrieres(matricule: number, idAca: number): Promise<any> {
    // On charge l'élève avec ses affectations (Frequente) pour déduire son cycle
    const eleve = await this.eleveRepository.findOne({
      where: { matricule },
      relations: [
        'frequentations',
        'frequentations.anneeAcademique',
        'frequentations.salle',
        'frequentations.salle.classe',
        'frequentations.salle.classe.cycle',
      ],
    });
    if (!eleve) throw new NotFoundException(`Élève introuvable (matricule: ${matricule})`);

    const annee = await this.anneeRepository.findOne({ where: { idAnnee: idAca } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${idAca})`);

    const paiements = await this.paiementRepository.find({
      where: { eleve: { matricule }, anneeAcademique: { idAnnee: idAca } },
      relations: ['mode'],
      order: { datePaie: 'ASC' },
    });
    const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);

    // Déduire la classe + le cycle via l'affectation de l'élève pour CETTE année
    const freq = (eleve.frequentations || []).find(
      (f) => Number(f.anneeAcademique?.idAnnee) === Number(idAca),
    );
    const classe = freq?.salle?.classe ?? null;
    const cycle = classe?.cycle ?? null;

    // Scolarité (frais) du cycle, avec ses tranches
    let scolarite: Scolarite | null = null;
    if (cycle) {
      scolarite = await this.scolariteRepository.findOne({
        where: { cycle: { idCycle: cycle.idCycle } },
        relations: ['tranches', 'cycle'],
      });
    }
    const inscription = scolarite ? scolarite.inscription : 0;
    const pension = scolarite ? scolarite.pension : 0;
    const totalDu = inscription + pension;
    const arriere = Math.max(0, totalDu - totalPaye);

    const r2 = (n: number) => Math.round(n * 100) / 100;
    return {
      matricule,
      annee: annee.libelle,
      classe: classe ? { idClasse: classe.idClasse, libelle: classe.libelle } : null,
      cycle: cycle ? { idCycle: cycle.idCycle, libelle: cycle.libelle } : null,
      scolariteDefinie: !!scolarite,
      inscription: r2(inscription),
      pension: r2(pension),
      tranches: (scolarite?.tranches || []).map((t) => ({
        idTranche: t.idTranche,
        libelle: t.libelle,
        montant: t.montant,
        delai_mois: t.delai_mois,
        delai_jour: t.delai_jour,
      })),
      totalDu: r2(totalDu),
      totalPaye: r2(totalPaye),
      arriere: r2(arriere),
      paiements,
    };
  }

  /**
   * Calcule les arriérés avec la scolarité du cycle de l'élève
   */
  async calculerArriereAvecScolarite(
    matricule: number,
    idAca: number,
    idCycle: number,
  ): Promise<{
    totalDu: number;
    totalPaye: number;
    arriere: number;
    scolarite: Scolarite;
  }> {
    const scolarite = await this.findScolariteByCycle(idCycle);

    const paiements = await this.paiementRepository.find({
      where: { eleve: { matricule }, anneeAcademique: { idAnnee: idAca } },
    });

    const totalDu = scolarite.inscription + scolarite.pension;
    const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
    const arriere = Math.max(0, totalDu - totalPaye);

    return {
      totalDu: Math.round(totalDu * 100) / 100,
      totalPaye: Math.round(totalPaye * 100) / 100,
      arriere: Math.round(arriere * 100) / 100,
      scolarite,
    };
  }
}
