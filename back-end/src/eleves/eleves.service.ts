import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Eleve } from '../entities/eleve.entity';
  import { Parents } from '../entities/parents.entity';
  import { VilleNaissance } from '../entities/ville-naissance.entity';
  import { Admin } from '../entities/admin.entity';
  import { Personne } from '../entities/personne.entity';
  import { Frequente } from '../entities/frequente.entity';
  import { Paiement } from '../entities/paiement.entity';
  import { Evaluation } from '../entities/evaluation.entity';
  import { Rapport } from '../entities/rapport.entity';
  import { CreateEleveDto, UpdateEleveDto, AddParentDto } from './dto/eleve.dto';
  
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
        actif: 1,
      });
  
      // Rattacher la ville de naissance si fournie
      if (dto.idVilleNaissance) {
        const ville = await this.villeRepository.findOne({
          where: { idVille: dto.idVilleNaissance },
        });
        if (!ville) {
          throw new NotFoundException(`Ville introuvable (id: ${dto.idVilleNaissance})`);
        }
        eleve.villeNaissance = ville;
      }
  
      // Rattacher l'admin : celui fourni, sinon l'admin racine par défaut
      // (permet à la scolarité — une Personne, pas un Admin — d'inscrire des élèves)
      let admin = dto.idAdmin
        ? await this.adminRepository.findOne({ where: { ID: dto.idAdmin } })
        : null;
      if (!admin) {
        const premier = await this.adminRepository.find({ order: { ID: 'ASC' }, take: 1 });
        admin = premier[0] ?? null;
      }
      if (admin) eleve.admin = admin;

      return this.eleveRepository.save(eleve);
    }
  
    // ─── Lister tous les élèves ────────────────────────────────────────────────
    async findAll(): Promise<Eleve[]> {
      return this.eleveRepository.find({
        relations: ['villeNaissance', 'parents', 'parents.personne'],
        order: { nom: 'ASC' },
      });
    }
  
    // ─── Lister uniquement les élèves actifs ───────────────────────────────────
    async findActifs(): Promise<Eleve[]> {
      return this.eleveRepository.find({
        where: { actif: 1 },
        relations: ['villeNaissance', 'parents', 'parents.personne'],
        order: { nom: 'ASC' },
      });
    }
  
    // ─── Lister les enfants d'un parent (par idPers du parent) ────────────────
    async findByParent(idPers: number): Promise<Eleve[]> {
      const liens = await this.parentsRepository.find({
        where: { personne: { idPers } },
        relations: ['eleve', 'eleve.villeNaissance'],
      });
      // Un parent peut être lié à plusieurs élèves ; on retourne les élèves
      return liens.map((lien) => lien.eleve).filter(Boolean);
    }

    // ─── Trouver un élève par matricule ───────────────────────────────────────
    async findOne(matricule: number): Promise<Eleve> {
      const eleve = await this.eleveRepository.findOne({
        where: { matricule },
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
      if (dto.actif !== undefined) eleve.actif = dto.actif;
  
      // Mise à jour ville de naissance
      if (dto.idVilleNaissance !== undefined) {
        const ville = await this.villeRepository.findOne({
          where: { idVille: dto.idVilleNaissance },
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
    async remove(matricule: number): Promise<{ message: string }> {
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
      if (frequentations) liens.push(`${frequentations} affectation(s)`);
      if (parents) liens.push(`${parents} lien(s) parent`);
      if (paiements) liens.push(`${paiements} paiement(s)`);
      if (notes) liens.push(`${notes} note(s)`);
      if (bulletins) liens.push(`${bulletins} bulletin(s)`);
      if (liens.length) {
        throw new ConflictException(
          `Impossible de supprimer définitivement cet élève : ${liens.join(', ')} lui sont rattaché(s). ` +
            `Utilisez plutôt la désactivation pour conserver l'historique.`,
        );
      }
      await this.eleveRepository.remove(eleve);
      return { message: `Élève matricule ${matricule} supprimé définitivement` };
    }
  
    // ─── Ajouter un parent à un élève ─────────────────────────────────────────
    async addParent(matricule: number, dto: AddParentDto): Promise<Parents> {
      const eleve = await this.findOne(matricule);
  
      const personne = await this.personneRepository.findOne({
        where: { idPers: dto.idPers },
        relations: ['admin'],
      });
      if (!personne) {
        throw new NotFoundException(`Personne introuvable (id: ${dto.idPers})`);
      }
  
      // Vérifier que ce parent n'est pas déjà lié à cet élève
      const exists = await this.parentsRepository.findOne({
        where: { personne: { idPers: dto.idPers }, eleve: { matricule } },
      });
      if (exists) {
        throw new ConflictException('Ce parent est déjà lié à cet élève');
      }
  
      const parent = this.parentsRepository.create({
        personne,
        eleve,
        admin: personne.admin, // idAdmin NOT NULL en BD — repris de la personne
      });

      return this.parentsRepository.save(parent);
    }
  
    // ─── Lister les parents d'un élève ────────────────────────────────────────
    async getParents(matricule: number): Promise<Parents[]> {
      await this.findOne(matricule); // vérifie que l'élève existe
      return this.parentsRepository.find({
        where: { eleve: { matricule } },
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