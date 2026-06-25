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
import { Cours } from '../entities/cours.entity';
import { Salle } from '../entities/salle.entity';
import { Classe } from '../entities/classe.entity';
import { MailService } from '../mail/mail.service';

// Génère un mot de passe provisoire lisible (sans caractères ambigus)
function genererMotDePasse(longueur = 10): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < longueur; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

const LIBELLE_TYPE: Record<number, string> = {
  1: 'Enseignant', 2: 'Administratif', 3: 'Scolarité', 4: 'Parent', 5: 'Personnel',
};
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

    @InjectRepository(Cours)
    private coursRepository: Repository<Cours>,

    @InjectRepository(Salle)
    private salleRepository: Repository<Salle>,

    @InjectRepository(Classe)
    private classeRepository: Repository<Classe>,

    private readonly mailService: MailService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // GESTION DES PERSONNES (profils enseignants)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Créer le profil Personne d'un enseignant
   * typePersonne = 2 (Professeur)
   */
  /**
   * Résout l'admin à rattacher (idAdmin NOT NULL), de la source la plus précise
   * à la moins précise :
   *   1. idAdmin explicitement fourni
   *   2. le créateur s'il est admin → lui-même
   *   3. le créateur s'il est une personne → son admin gestionnaire
   *   4. repli : l'admin racine (le plus ancien)
   */
  private async resoudreAdmin(
    dtoIdAdmin?: number,
    user?: { id: number; role: string },
  ): Promise<Admin | null> {
    if (dtoIdAdmin) {
      const a = await this.adminRepository.findOne({ where: { ID: dtoIdAdmin } });
      if (a) return a;
    }
    if (user?.role === 'admin' && user.id) {
      const a = await this.adminRepository.findOne({ where: { ID: user.id } });
      if (a) return a;
    }
    if (user?.role === 'personne' && user.id) {
      const p = await this.personneRepository.findOne({ where: { idPers: user.id }, relations: ['admin'] });
      if (p?.admin) return p.admin;
    }
    const premier = await this.adminRepository.find({ order: { ID: 'ASC' }, take: 1 });
    return premier[0] ?? null;
  }

  async createPersonne(
    dto: CreatePersonneEnseignantDto,
    user?: { id: number; role: string },
  ): Promise<Personne> {
    // Vérifier que le username n'existe pas déjà
    const exists = await this.personneRepository.findOne({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException(
        `Le nom d'utilisateur "${dto.username}" est déjà utilisé`,
      );
    }

    // Mot de passe : fourni, sinon généré par le backend (envoyé ensuite par email)
    const motDePasseGenere = !dto.password;
    const motDePasseClair = dto.password ?? genererMotDePasse();
    const hashedPassword = await bcrypt.hash(motDePasseClair, 10);

    // Valeurs par défaut pour les colonnes NOT NULL non renseignées
    const personne = this.personneRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : new Date('2000-01-01'),
      lieuNaissance: dto.lieuNaissance ?? 'INDEFINI',
      mobile: dto.mobile ?? '000',
      phone: dto.phone ?? '000',
      typePersonne: dto.typePersonne ?? 2, // défaut : 2 = Professeur
      username: dto.username,
      password: hashedPassword,
    });

    // Admin gestionnaire : attribution précise (créateur), repli sur l'admin racine
    const admin = await this.resoudreAdmin(dto.idAdmin, user);
    if (admin) personne.admin = admin;

    const saved = await this.personneRepository.save(personne);

    // Si le mot de passe a été généré, on envoie les identifiants par email
    let emailEnvoye: boolean | null = null;
    if (motDePasseGenere) {
      emailEnvoye = await this.mailService.envoyerIdentifiants({
        to: dto.username,
        nomComplet: `${dto.prenom} ${dto.nom}`,
        username: dto.username,
        motDePasse: motDePasseClair,
        role: LIBELLE_TYPE[dto.typePersonne ?? 2] ?? 'Personnel',
      });
    }

    // On expose le statut d'envoi pour que le frontend puisse alerter si échec
    (saved as any).emailEnvoye = emailEnvoye;
    return saved;
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

  /** Lister toutes les personnes, tous types confondus (pour choisir un expéditeur de message) */
  async findAllPersonnesTous(): Promise<Personne[]> {
    return this.personneRepository.find({ order: { nom: 'ASC' } });
  }

  /**
   * Supprimer un compte Personne (membre du personnel ou parent).
   * On retire d'abord ses liens directs (enseignant, titulaire).
   */
  async removePersonne(idPers: number): Promise<{ message: string }> {
    const personne = await this.personneRepository.findOne({ where: { idPers } });
    if (!personne) throw new NotFoundException('Personne introuvable');

    const ens = await this.enseignantRepository.find({ where: { personne: { idPers } } });
    if (ens.length) await this.enseignantRepository.remove(ens);
    const tits = await this.titulaireRepository.find({ where: { personne: { idPers } } });
    if (tits.length) await this.titulaireRepository.remove(tits);

    try {
      await this.personneRepository.remove(personne);
    } catch {
      throw new ConflictException(
        "Suppression impossible : ce compte est lié à d'autres données (messages, notes, paiements, parent…).",
      );
    }
    return { message: 'Compte supprimé' };
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

    // Classe gérée (obligatoire) : l'enseignant y donne toutes les matières
    const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
    if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);

    // Matière de difficulté (cours qu'il ne donne pas) — optionnelle
    let cours: Cours | undefined = undefined;
    if (dto.idCours) {
      const c = await this.coursRepository.findOne({ where: { idCours: dto.idCours } });
      if (!c) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);
      cours = c;
    }

    const enseignant = this.enseignantRepository.create({
      personne,
      classe,
      cours,
      actif: 1, // ✅ minuscule corrigé
    });

    // Admin : fourni, sinon l'admin racine par défaut (idAdmin NOT NULL en BD)
    let admin = dto.idAdmin
      ? await this.adminRepository.findOne({ where: { ID: dto.idAdmin } })
      : null;
    if (!admin) {
      const premier = await this.adminRepository.find({ order: { ID: 'ASC' }, take: 1 });
      admin = premier[0] ?? null;
    }
    if (admin) enseignant.admin = admin;

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

    // idSalle est NOT NULL en BD
    const salle = await this.salleRepository.findOne({ where: { idSalle: dto.idSalle } });
    if (!salle) throw new NotFoundException(`Salle introuvable (id: ${dto.idSalle})`);

    // Une salle ne peut avoir qu'UN SEUL titulaire actif
    const dejaTitulaire = await this.titulaireRepository.findOne({
      where: { salle: { idSalle: dto.idSalle }, actif: 1 },
    });
    if (dejaTitulaire) {
      throw new ConflictException(
        "Cette salle a déjà un titulaire actif. Désactivez-le avant d'en affecter un autre.",
      );
    }

    const titulaire = this.titulaireRepository.create({
      personne,
      salle,
      actif: 1,
    });

    // Admin : celui fourni, sinon l'admin racine par défaut
    let admin = dto.idAdmin
      ? await this.adminRepository.findOne({ where: { ID: dto.idAdmin } })
      : null;
    if (!admin) {
      const premier = await this.adminRepository.find({ order: { ID: 'ASC' }, take: 1 });
      admin = premier[0] ?? null;
    }
    if (admin) titulaire.admin = admin;

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