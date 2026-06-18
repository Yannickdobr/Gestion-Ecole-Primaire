import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Enseignant } from '../entities/enseignant.entity';
import { Titulaire } from '../entities/titulaire.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';
import {
  CreatePersonneEnseignantDto,
  UpdatePersonneEnseignantDto,
  CreateEnseignantDto,
  CreateTitulaireDto,
} from './dto/professeur.dto';

@Injectable()
export class ProfesseursService {
  constructor(
    @InjectRepository(Enseignant)
    private enseignantRepository: Repository<Enseignant>,

    @InjectRepository(Titulaire)
    private titulaireRepository: Repository<Titulaire>,

    @InjectRepository(Personne)
    private personneRepository: Repository<Personne>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DES PERSONNES (profils enseignants)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Créer le profil Personne d'un enseignant
   * typePersonne = 2 (Professeur)
   */
  async createPersonne(dto: CreatePersonneEnseignantDto): Promise<Personne> {
    // Vérifier que le username n'existe pas déjà
    const exists = await this.personneRepository.findOne({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException(
        `Le nom d'utilisateur "${dto.username}" est déjà utilisé`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const personne = this.personneRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
      lieuNaissance: dto.lieuNaissance,
      mobile: dto.mobile,
      phone: dto.phone,
      typePersonne: 2, // 2 = Professeur
      username: dto.username,
      password: hashedPassword,
    });

    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({
        where: { ID: dto.idAdmin },
      });
      if (admin) personne.admin = admin;
    }

    return this.personneRepository.save(personne);
  }

  /**
   * Lister toutes les personnes de type Professeur (typePersonne = 2)
   */
  async findAllPersonnes(): Promise<Personne[]> {
    return this.personneRepository.find({
      where: { typePersonne: 2 },
      order: { nom: 'ASC' },
    });
  }

  /**
   * Trouver une personne par son id
   */
  async findPersonneById(idPers: number): Promise<Personne> {
    const personne = await this.personneRepository.findOne({
      where: { idPers },
    });
    if (!personne) {
      throw new NotFoundException(`Personne introuvable (id: ${idPers})`);
    }
    return personne;
  }

  /**
   * Mettre à jour le profil d'un enseignant
   */
  async updatePersonne(
    idPers: number,
    dto: UpdatePersonneEnseignantDto,
  ): Promise<Personne> {
    const personne = await this.findPersonneById(idPers);

    if (dto.nom !== undefined) personne.nom = dto.nom;
    if (dto.prenom !== undefined) personne.prenom = dto.prenom;
    if (dto.dateNaissance !== undefined)
      personne.dateNaissance = new Date(dto.dateNaissance);
    if (dto.lieuNaissance !== undefined) personne.lieuNaissance = dto.lieuNaissance;
    if (dto.mobile !== undefined) personne.mobile = dto.mobile;
    if (dto.phone !== undefined) personne.phone = dto.phone;

    // Vérifier unicité du username si modifié
    if (dto.username !== undefined && dto.username !== personne.username) {
      const exists = await this.personneRepository.findOne({
        where: { username: dto.username },
      });
      if (exists) {
        throw new ConflictException(
          `Le nom d'utilisateur "${dto.username}" est déjà utilisé`,
        );
      }
      personne.username = dto.username;
    }

    return this.personneRepository.save(personne);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DES ENSEIGNANTS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une Personne comme Enseignant
   */
  async createEnseignant(dto: CreateEnseignantDto): Promise<Enseignant> {
    const personne = await this.findPersonneById(dto.idPers);

    // Vérifier qu'il n'est pas déjà enregistré comme enseignant
    const exists = await this.enseignantRepository.findOne({
      where: { personne: { idPers: dto.idPers } },
    });
    if (exists) {
      throw new ConflictException('Cette personne est déjà enregistrée comme enseignant');
    }

    const enseignant = this.enseignantRepository.create({
      personne,
      actif: 1, // ✅ minuscule corrigé
    });

    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({
        where: { ID: dto.idAdmin },
      });
      if (admin) enseignant.admin = admin;
    }

    return this.enseignantRepository.save(enseignant);
  }

  /**
   * Lister tous les enseignants
   */
  async findAllEnseignants(): Promise<Enseignant[]> {
    return this.enseignantRepository.find({
      relations: ['personne'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Lister les enseignants actifs
   */
  async findEnseignantsActifs(): Promise<Enseignant[]> {
    return this.enseignantRepository.find({
      where: { actif: 1 }, // ✅ minuscule corrigé
      relations: ['personne'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Trouver un enseignant par son id
   */
  async findEnseignantById(idEnseignant: number): Promise<Enseignant> {
    const enseignant = await this.enseignantRepository.findOne({
      where: { idEnseignant },
      relations: ['personne'],
    });
    if (!enseignant) {
      throw new NotFoundException(`Enseignant introuvable (id: ${idEnseignant})`);
    }
    return enseignant;
  }

  /**
   * Désactiver un enseignant
   */
  async desactiverEnseignant(idEnseignant: number): Promise<{ message: string }> {
    const enseignant = await this.findEnseignantById(idEnseignant);
    enseignant.actif = 0; // ✅ minuscule
    await this.enseignantRepository.save(enseignant);
    return {
      message: `Enseignant ${enseignant.personne.prenom} ${enseignant.personne.nom} désactivé`,
    };
  }

  /**
   * Réactiver un enseignant
   */
  async activerEnseignant(idEnseignant: number): Promise<{ message: string }> {
    const enseignant = await this.findEnseignantById(idEnseignant);
    enseignant.actif = 1;
    await this.enseignantRepository.save(enseignant);
    return {
      message: `Enseignant ${enseignant.personne.prenom} ${enseignant.personne.nom} activé`,
    };
  }

  /**
   * Supprimer un enseignant
   */
  async removeEnseignant(idEnseignant: number): Promise<{ message: string }> {
    const enseignant = await this.findEnseignantById(idEnseignant);
    await this.enseignantRepository.remove(enseignant);
    return { message: `Enseignant id ${idEnseignant} supprimé` };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DES TITULAIRES
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Enregistrer une Personne comme Titulaire de classe
   */
  async createTitulaire(dto: CreateTitulaireDto): Promise<Titulaire> {
    const personne = await this.findPersonneById(dto.idPers);

    const exists = await this.titulaireRepository.findOne({
      where: { personne: { idPers: dto.idPers } },
    });
    if (exists) {
      throw new ConflictException('Cette personne est déjà enregistrée comme titulaire');
    }

    const titulaire = this.titulaireRepository.create({
      personne,
      actif: 1,
    });

    if (dto.idAdmin) {
      const admin = await this.adminRepository.findOne({
        where: { ID: dto.idAdmin },
      });
      if (admin) titulaire.admin = admin;
    }

    return this.titulaireRepository.save(titulaire);
  }

  /**
   * Lister tous les titulaires
   */
  async findAllTitulaires(): Promise<Titulaire[]> {
    return this.titulaireRepository.find({
      relations: ['personne'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Trouver un titulaire par son id
   */
  async findTitulaireById(idTitulaire: number): Promise<Titulaire> {
    const titulaire = await this.titulaireRepository.findOne({
      where: { idTitulaire },
      relations: ['personne'],
    });
    if (!titulaire) {
      throw new NotFoundException(`Titulaire introuvable (id: ${idTitulaire})`);
    }
    return titulaire;
  }

  /**
   * Désactiver un titulaire
   */
  async desactiverTitulaire(idTitulaire: number): Promise<{ message: string }> {
    const titulaire = await this.findTitulaireById(idTitulaire);
    titulaire.actif = 0;
    await this.titulaireRepository.save(titulaire);
    return {
      message: `Titulaire ${titulaire.personne.prenom} ${titulaire.personne.nom} désactivé`,
    };
  }

  /**
   * Supprimer un titulaire
   */
  async removeTitulaire(idTitulaire: number): Promise<{ message: string }> {
    const titulaire = await this.findTitulaireById(idTitulaire);
    await this.titulaireRepository.remove(titulaire);
    return { message: `Titulaire id ${idTitulaire} supprimé` };
  }

  /**
   * Recherche d'un enseignant par nom ou prénom
   */
  async search(query: string): Promise<Personne[]> {
    return this.personneRepository
      .createQueryBuilder('personne')
      .where('personne.typePersonne = :type', { type: 2 })
      .andWhere('personne.nom LIKE :q OR personne.prenom LIKE :q', {
        q: `%${query}%`,
      })
      .orderBy('personne.nom', 'ASC')
      .getMany();
  }
}