import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Justificatifs } from '../entities/justificatifs.entity';
import { FicheEnseignant } from '../entities/fiche-enseignant.entity';
import { Quartier } from '../entities/quartier.entity';
import { Residents } from '../entities/residents.entity';
import { Enseignant } from '../entities/enseignant.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';
import { verifierAvantSuppression } from '../common/referential-integrity';
import {
  CreateJustificatifDto, CreateFicheEnseignantDto, CreateQuartierDto, CreateResidentDto,
} from './dto/administration.dto';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(Justificatifs) private justifRepo: Repository<Justificatifs>,
    @InjectRepository(FicheEnseignant) private ficheRepo: Repository<FicheEnseignant>,
    @InjectRepository(Quartier) private quartierRepo: Repository<Quartier>,
    @InjectRepository(Residents) private residentsRepo: Repository<Residents>,
    @InjectRepository(Enseignant) private enseignantRepo: Repository<Enseignant>,
    @InjectRepository(AnneeAcademique) private anneeRepo: Repository<AnneeAcademique>,
    @InjectRepository(Personne) private personneRepo: Repository<Personne>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
  ) {}

  private async adminParDefaut(idAdmin?: number): Promise<Admin> {
    if (idAdmin) {
      const a = await this.adminRepo.findOne({ where: { ID: idAdmin,
          isDelete: 0
    } });
      if (a) return a;
    }
    return (await this.adminRepo.find({
        where: { isDelete: 0 },
        order: { ID: 'ASC' }, take: 1 }))[0];
  }

  // ═══ JUSTIFICATIFS ═════════════════════════════════════════════════════════
  findAllJustificatifs(): Promise<Justificatifs[]> {
    return this.justifRepo.find({
        where: { isDelete: 0 },
        order: { created_at: 'DESC' } });
  }

  findJustificatifsByRapport(idRapport: number): Promise<Justificatifs[]> {
    return this.justifRepo.find({ where: { idRapport,
        isDelete: 0
    }, order: { created_at: 'DESC' } });
  }

  createJustificatif(dto: CreateJustificatifDto): Promise<Justificatifs> {
    const j = this.justifRepo.create({
      idRapport: dto.idRapport,
      commentaire: dto.commentaire ?? 'RAS', // NOT NULL
      idDirecteur: dto.idDirecteur,           // nullable → laissé NULL si absent
      urlDoc: dto.urlDoc,                      // nullable → laissé NULL si absent
    });
    return this.justifRepo.save(j);
  }

  async validerJustificatif(id: number, idDirecteur?: number): Promise<Justificatifs> {
    const j = await this.justifRepo.findOne({ where: { ID: id,
        isDelete: 0
    } });
    if (!j) throw new NotFoundException(`Justificatif introuvable (id: ${id})`);
    // Validé = un directeur est renseigné (repli sur l'admin racine si non fourni)
    j.idDirecteur = idDirecteur ?? (await this.adminParDefaut()).ID;
    return this.justifRepo.save(j);
  }

  async removeJustificatif(id: number): Promise<{ message: string }> {
    const j = await this.justifRepo.findOne({ where: { ID: id,
        isDelete: 0
    } });
    if (!j) throw new NotFoundException(`Justificatif introuvable (id: ${id})`);
    j.isDelete = 1;
    await this.justifRepo.save(j);
    return { message: `Justificatif ${id} supprimé` };
  }

  // ═══ FICHES ENSEIGNANT (RH) ════════════════════════════════════════════════
  findFichesByEnseignant(idEnseignant: number): Promise<FicheEnseignant[]> {
    return this.ficheRepo.find({
      where: { enseignant: { idEnseignant },
          isDelete: 0
    },
      relations: ['anneeAcademique'],
      order: { created_at: 'DESC' },
    });
  }

  async createFiche(dto: CreateFicheEnseignantDto): Promise<FicheEnseignant> {
    const enseignant = await this.enseignantRepo.findOne({ where: { idEnseignant: dto.idEnseignant,
        isDelete: 0
    } });
    if (!enseignant) throw new NotFoundException(`Enseignant introuvable (id: ${dto.idEnseignant})`);
    const annee = await this.anneeRepo.findOne({ where: { idAnnee: dto.idAca,
        isDelete: 0
    } });
    if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${dto.idAca})`);

    // idAdministratif NOT NULL : fourni, sinon l'admin racine
    const idAdministratif = dto.idAdministratif ?? (await this.adminParDefaut()).ID;

    const fiche = this.ficheRepo.create({
      libelle: dto.libelle,
      points: dto.points ?? 0,                          // NOT NULL
      commentaire: dto.commentaire ?? 'RAS',            // NOT NULL
      event_date: dto.event_date ? new Date(dto.event_date) : new Date(), // NOT NULL
      idAdministratif,
      enseignant,
      anneeAcademique: annee,
    });
    return this.ficheRepo.save(fiche);
  }

  async removeFiche(idRap: number): Promise<{ message: string }> {
    const f = await this.ficheRepo.findOne({ where: { idRap,
        isDelete: 0
    } });
    if (!f) throw new NotFoundException(`Fiche introuvable (id: ${idRap})`);
    f.isDelete = 1;
    await this.ficheRepo.save(f);
    return { message: `Fiche ${idRap} supprimée` };
  }

  // ═══ QUARTIERS ═════════════════════════════════════════════════════════════
  findAllQuartiers(): Promise<Quartier[]> {
    return this.quartierRepo.find({
        where: { isDelete: 0 },
        order: { libelle: 'ASC' } });
  }

  createQuartier(dto: CreateQuartierDto): Promise<Quartier> {
    const q = this.quartierRepo.create({
      libelle: dto.libelle,
      description: dto.description ?? 'INDEFINI', // NOT NULL
    });
    return this.quartierRepo.save(q);
  }

  async removeQuartier(idQuartier: number): Promise<{ message: string }> {
    const q = await this.quartierRepo.findOne({ where: { idQuartier,
        isDelete: 0
    } });
    if (!q) throw new NotFoundException(`Quartier introuvable (id: ${idQuartier})`);
    await verifierAvantSuppression(
      this.quartierRepo.manager,
      `le quartier "${q.libelle}"`,
      [{ entity: Residents, where: { quartier: { idQuartier } }, label: (n) => `${n} résident(s)` }],
    );
    q.isDelete = 1;
    await this.quartierRepo.save(q);
    return { message: `Quartier "${q.libelle}" supprimé` };
  }

  // ═══ RÉSIDENTS (personne ↔ quartier) ═══════════════════════════════════════
  findAllResidents(): Promise<Residents[]> {
    return this.residentsRepo.find({
        where: { isDelete: 0 },
        relations: ['personne', 'quartier'],
      order: { created_at: 'DESC' },
    });
  }

  findResidentsByQuartier(idQuartier: number): Promise<Residents[]> {
    return this.residentsRepo.find({
      where: { quartier: { idQuartier },
          isDelete: 0
    },
      relations: ['personne', 'quartier'],
      order: { created_at: 'DESC' },
    });
  }

  async createResident(dto: CreateResidentDto): Promise<Residents> {
    const personne = await this.personneRepo.findOne({ where: { idPers: dto.idPers,
        isDelete: 0
    } });
    if (!personne) throw new NotFoundException(`Personne introuvable (id: ${dto.idPers})`);
    const quartier = await this.quartierRepo.findOne({ where: { idQuartier: dto.idQuartier,
        isDelete: 0
    } });
    if (!quartier) throw new NotFoundException(`Quartier introuvable (id: ${dto.idQuartier})`);

    const r = this.residentsRepo.create({
      description: dto.description ?? 'RAS', // NOT NULL
      personne,
      quartier,
      admin: await this.adminParDefaut(dto.idAdmin), // idAdmin NOT NULL
    });
    return this.residentsRepo.save(r);
  }

  async removeResident(idResi: number): Promise<{ message: string }> {
    const r = await this.residentsRepo.findOne({ where: { idResi,
        isDelete: 0
    } });
    if (!r) throw new NotFoundException(`Résident introuvable (id: ${idResi})`);
    r.isDelete = 1;
    await this.residentsRepo.save(r);
    return { message: `Résident ${idResi} supprimé` };
  }
}
