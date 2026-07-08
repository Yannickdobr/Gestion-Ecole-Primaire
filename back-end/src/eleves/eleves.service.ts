import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Eleve } from "../entities/eleve.entity";
import { Parents } from "../entities/parents.entity";
import { VilleNaissance } from "../entities/ville-naissance.entity";
import { Admin } from "../entities/admin.entity";
import { Personne } from "../entities/personne.entity";
import { Frequente } from "../entities/frequente.entity";
import { Paiement } from "../entities/paiement.entity";
import { Evaluation } from "../entities/evaluation.entity";
import { Rapport } from "../entities/rapport.entity";
import { CreateEleveDto, UpdateEleveDto, AddParentDto } from "./dto/eleve.dto";
import { verifierAvantSuppression } from "../common/referential-integrity";

@Injectable()
export class ElevesService {
  constructor(
    @InjectRepository(Eleve)
    private eleveRepository: Repository<Eleve>,
  
      @InjectRepository(Parents)
      private parentsRepository: Repository<Parents>,
  
      @InjectRepository(VilleNaissance)
      private villeRepository: Repository<VilleNaissance>,
  
      @InjectRepository(Admin)
      private adminRepository: Repository<Admin>,
  
      @InjectRepository(Personne)
      private personneRepository: Repository<Personne>,
    ) {}
  
    // ─── Créer un élève ────────────────────────────────────────────────────────
    async create(dto: CreateEleveDto): Promise<Eleve> {
      // Valeurs par défaut pour les colonnes NOT NULL non renseignées
      const eleve = this.eleveRepository.create({
        nom: dto.nom,
        prenom: dto.prenom,
        dateNaissance: new Date(dto.dateNaissance),
        lieuNaissance: dto.lieuNaissance ?? 'INDEFINI',
        sexe: dto.sexe,
        langue: dto.langue ?? 'INDEFINI',
        photoURL: dto.photoURL ?? 'INDEFINI',
        groupeSanguin: dto.groupeSanguin?.trim() || null,
        actif: 1,
      });
  
      // Rattacher la ville de naissance si fournie
      if (dto.idVilleNaissance) {
        const ville = await this.villeRepository.findOne({
          where: { idVille: dto.idVilleNaissance,
              isDelete: 0
        },
        });
        if (!ville) {
          throw new NotFoundException(`Ville introuvable (id: ${dto.idVilleNaissance})`);
        }
        eleve.villeNaissance = ville;
      }
  
      // Rattacher l'admin : celui fourni, sinon l'admin racine par défaut
      // (permet à la scolarité — une Personne, pas un Admin — d'inscrire des élèves)
      let admin = dto.idAdmin
        ? await this.adminRepository.findOne({ where: { ID: dto.idAdmin,
            isDelete: 0
        } })
        : null;
      if (!admin) {
        const premier = await this.adminRepository.find({
            where: { isDelete: 0 },
            order: { ID: 'ASC' }, take: 1 });
        admin = premier[0] ?? null;
      }
      if (admin) eleve.admin = admin;

      return this.eleveRepository.save(eleve);
    }
  
    // ─── Lister tous les élèves ────────────────────────────────────────────────
    async findAll(): Promise<Eleve[]> {
      return this.eleveRepository.find({
          where: { isDelete: 0 },
        relations: ['villeNaissance', 'parents', 'parents.personne'],
        order: { nom: 'ASC' },
      });
    }
  
    // ─── Lister uniquement les élèves actifs ───────────────────────────────────
    async findActifs(): Promise<Eleve[]> {
      return this.eleveRepository.find({
        where: { actif: 1,
            isDelete: 0
        },
        relations: ['villeNaissance', 'parents', 'parents.personne'],
        order: { nom: 'ASC' },
      });
    }
  
    // ─── Lister les enfants d'un parent (par idPers du parent) ────────────────
    async findByParent(idPers: number): Promise<Eleve[]> {
      const liens = await this.parentsRepository.find({
        where: { personne: { idPers },
            isDelete: 0
        },
        relations: ['eleve', 'eleve.villeNaissance'],
      });
      // Un parent peut être lié à plusieurs élèves ; on retourne les élèves
      return liens.map((lien) => lien.eleve).filter(Boolean);
    }

    // ─── Trouver un élève par matricule ───────────────────────────────────────
    async findOne(matricule: number): Promise<Eleve> {
      const eleve = await this.eleveRepository.findOne({
        where: { matricule,
            isDelete: 0
        },
        relations: ['villeNaissance', 'parents', 'parents.personne'],
      });
      if (!eleve) {
        throw new NotFoundException(`Élève avec le matricule ${matricule} introuvable`);
      }
      return eleve;
    }
  
    // ─── Mettre à jour un élève ────────────────────────────────────────────────
    async update(matricule: number, dto: UpdateEleveDto): Promise<Eleve> {
      const eleve = await this.findOne(matricule);
  
      // Mise à jour des champs simples
      if (dto.nom !== undefined) eleve.nom = dto.nom;
      if (dto.prenom !== undefined) eleve.prenom = dto.prenom;
      if (dto.dateNaissance !== undefined) eleve.dateNaissance = new Date(dto.dateNaissance);
      if (dto.lieuNaissance !== undefined) eleve.lieuNaissance = dto.lieuNaissance;
      if (dto.sexe !== undefined) eleve.sexe = dto.sexe;
      if (dto.langue !== undefined) eleve.langue = dto.langue;
      if (dto.photoURL !== undefined) eleve.photoURL = dto.photoURL;
      if (dto.groupeSanguin !== undefined) eleve.groupeSanguin = dto.groupeSanguin?.trim() || null;
      if (dto.actif !== undefined) eleve.actif = dto.actif;
  
      // Mise à jour ville de naissance
      if (dto.idVilleNaissance !== undefined) {
        const ville = await this.villeRepository.findOne({
          where: { idVille: dto.idVilleNaissance,
              isDelete: 0
        },
        });
        if (!ville) {
          throw new NotFoundException(`Ville introuvable (id: ${dto.idVilleNaissance})`);
        }
        eleve.villeNaissance = ville;
      }
  
      return this.eleveRepository.save(eleve);
    }
  
    // ─── Désactiver un élève (soft delete) ────────────────────────────────────
    async desactiver(matricule: number): Promise<{ message: string }> {
      const eleve = await this.findOne(matricule);
      eleve.actif = 0;
      await this.eleveRepository.save(eleve);
      return { message: `Élève ${eleve.prenom} ${eleve.nom} désactivé avec succès` };
    }

    async activer(matricule: number): Promise<{ message: string }> {
      const eleve = await this.findOne(matricule);
      eleve.actif = 1;
      await this.eleveRepository.save(eleve);
      return { message: `Élève ${eleve.prenom} ${eleve.nom} réactivé avec succès` };
    }
  
    // ─── Supprimer définitivement un élève ────────────────────────────────────
    async remove(matricule: number, force: boolean = false): Promise<{ message: string }> {
    const eleve = await this.findOne(matricule);
    await verifierAvantSuppression(
      this.eleveRepository.manager,
      `l"�l�ve "${eleve.prenom} ${eleve.nom}"`,
      [
        { entity: Frequente, where: { eleve: { matricule } }, label: (n) => `${n} affectation(s)` },
        { entity: Parents, where: { eleve: { matricule } }, label: (n) => `${n} lien(s) parent` },
        { entity: Paiement, where: { eleve: { matricule } }, label: (n) => `${n} paiement(s)` },
        { entity: Evaluation, where: { eleve: { matricule } }, label: (n) => `${n} note(s)` },
        { entity: Rapport, where: { eleve: { matricule } }, label: (n) => `${n} bulletin(s)` },
      ],
      force
    );
    eleve.isDelete = 1;
    await this.eleveRepository.save(eleve);
    return { message: `�l�ve matricule ${matricule} supprim� d�finitivement` };
  }

  // ─── Ajouter un parent à un élève ──────────────────────────────────────────
  async addParent(matricule: number, dto: AddParentDto): Promise<Parents> {
    const eleve = await this.findOne(matricule);
    const personne = await this.personneRepository.findOne({ where: { idPers: dto.idPers, isDelete: 0 } });
    if (!personne) {
      throw new NotFoundException(`Personne introuvable (id: ${dto.idPers})`);
    }

    const existing = await this.parentsRepository.findOne({
      where: { eleve: { matricule }, personne: { idPers: dto.idPers }, isDelete: 0 }
    });
    if (existing) {
      throw new ConflictException("Ce parent est déjà lié à cet élève.");
    }

    const parent = this.parentsRepository.create({
      eleve,
      personne,
      admin: eleve.admin
    });
    return this.parentsRepository.save(parent);
  }

  async getParents(matricule: number): Promise<Parents[]> {
      await this.findOne(matricule); // vérifie que l'élève existe
      return this.parentsRepository.find({
        where: { eleve: { matricule },
            isDelete: 0
        },
        relations: ['personne'],
      });
    }
  
    // ─── Recherche par nom ou prénom ───────────────────────────────────────────
    async search(query: string): Promise<Eleve[]> {
      return this.eleveRepository
        .createQueryBuilder('eleve')
        .leftJoinAndSelect('eleve.villeNaissance', 'ville')
        .where('eleve.nom LIKE :q OR eleve.prenom LIKE :q', { q: `%${query}%` })
        .orderBy('eleve.nom', 'ASC')
        .getMany();
    }
  }