import {
  Injectable,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Enseignant } from '../entities/enseignant.entity';
import { Titulaire } from '../entities/titulaire.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';
import { Cours } from '../entities/cours.entity';
import { Salle } from '../entities/salle.entity';
import { Classe } from '../entities/classe.entity';
import { MailService } from '../mail/mail.service';
import { verifierAvantSuppression } from '../common/referential-integrity';
import { Parents } from '../entities/parents.entity';
import { Residents } from '../entities/residents.entity';

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
      const a = await this.adminRepository.findOne({ where: { ID: dtoIdAdmin,
          isDelete: 0
    } });
      if (a) return a;
    }
    if (user?.role === 'admin' && user.id) {
      const a = await this.adminRepository.findOne({ where: { ID: user.id,
          isDelete: 0
    } });
      if (a) return a;
    }
    if (user?.role === 'personne' && user.id) {
      const p = await this.personneRepository.findOne({ where: { idPers: user.id,
          isDelete: 0
    }, relations: ['admin'] });
      if (p?.admin) return p.admin;
    }
    const premier = await this.adminRepository.find({
        where: { isDelete: 0 },
        order: { ID: 'ASC' }, take: 1 });
    return premier[0] ?? null;
  }

  async createPersonne(
    dto: CreatePersonneEnseignantDto,
    user?: { id: number; role: string },
  ): Promise<Personne> {
    // ── Restauration d'un ancien compte ──────────────────────────────────────
    if ((dto as any).restoreId) {
      const ancien = await this.personneRepository.findOne({
        where: { idPers: (dto as any).restoreId, isDelete: 1 },
        relations: ['admin'],
      });
      if (!ancien) throw new NotFoundException('Ancien compte introuvable pour la restauration');

      // Restaurer le compte : remettre isDelete à 0 et retirer le suffixe _DELETED_
      ancien.isDelete = 0;
      ancien.username = dto.username; // on remet l'email propre
      ancien.nom = dto.nom;
      ancien.prenom = dto.prenom;
      if (dto.dateNaissance) ancien.dateNaissance = new Date(dto.dateNaissance);
      if (dto.lieuNaissance) ancien.lieuNaissance = dto.lieuNaissance;
      if (dto.mobile) ancien.mobile = dto.mobile;
      if (dto.phone) ancien.phone = dto.phone;
      if (dto.typePersonne !== undefined) ancien.typePersonne = dto.typePersonne;

      // Nouveau mot de passe
      const motDePasseClair = dto.password ? dto.password : genererMotDePasse();
      ancien.password = await bcrypt.hash(motDePasseClair, 10);

      const admin = await this.resoudreAdmin(dto.idAdmin, user);
      if (admin) ancien.admin = admin;

      // On envoie les nouveaux identifiants AVANT d'enregistrer la restauration :
      // si l'envoi échoue, le compte reste supprimé (aucune modification persistée).
      const emailEnvoye = await this.mailService.envoyerIdentifiants({
        to: dto.username,
        nomComplet: `${dto.prenom} ${dto.nom}`,
        username: dto.username,
        motDePasse: motDePasseClair,
        role: LIBELLE_TYPE[dto.typePersonne ?? 1] ?? 'Personnel',
      });
      if (!emailEnvoye) {
        throw new ServiceUnavailableException(
          `Compte non restauré : impossible d'envoyer les identifiants à "${dto.username}". Vérifiez l'adresse e-mail et réessayez.`,
        );
      }

      const saved = await this.personneRepository.save(ancien);
      (saved as any).emailEnvoye = emailEnvoye;
      (saved as any).restored = true;
      return saved;
    }

    // ── Vérifier que le username n'existe pas déjà (actif) ───────────────────
    const exists = await this.personneRepository.findOne({
      where: { username: dto.username, isDelete: 0 },
    });
    if (exists) {
      throw new ConflictException(
        `Le nom d'utilisateur "${dto.username}" est déjà utilisé`,
      );
    }

    // ── Vérifier s'il existe un ancien compte supprimé avec ce même email ────
    if (!(dto as any).forceNew) {
      const ancienSupprime = await this.personneRepository.findOne({
        where: { username: Like(`${dto.username}_DELETED_%`), isDelete: 1 },
        order: { idPers: 'DESC' }, // le compte supprimé le PLUS RÉCENT
      });
      if (ancienSupprime) {
        throw new ConflictException({
          message: `Un ancien compte avec l'email "${dto.username}" existe déjà mais a été supprimé. Voulez-vous le restaurer ?`,
          requireRestoreChoice: true,
          restoreId: ancienSupprime.idPers,
          ancienNom: `${ancienSupprime.prenom} ${ancienSupprime.nom}`,
        });
      }
    }

    // ── Création normale ─────────────────────────────────────────────────────
    // Mot de passe : fourni, sinon généré par le backend (envoyé ensuite par email)
    const motDePasseGenere = !dto.password;
    const motDePasseClair = dto.password ? dto.password : genererMotDePasse();
    const hashedPassword = await bcrypt.hash(motDePasseClair, 10);

    // Valeurs par défaut pour les colonnes NOT NULL non renseignées
    const personne = this.personneRepository.create({
      nom: dto.nom,
      prenom: dto.prenom,
      dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : new Date('2000-01-01'),
      lieuNaissance: dto.lieuNaissance ?? 'INDEFINI',
      mobile: dto.mobile ?? '000',
      phone: dto.phone ?? '000',
      typePersonne: dto.typePersonne ?? 1, // défaut : 1 = Enseignant
      username: dto.username,
      password: hashedPassword,
    });

    // Admin gestionnaire : attribution précise (créateur), repli sur l'admin racine
    const admin = await this.resoudreAdmin(dto.idAdmin, user);
    if (admin) personne.admin = admin;

    // Si le mot de passe est GÉNÉRÉ, l'utilisateur ne peut accéder au compte que par
    // l'email d'identifiants : on l'envoie AVANT d'enregistrer. Si l'envoi échoue,
    // on n'enregistre RIEN (pas de compte fantôme sans identifiants).
    // (Si le créateur a saisi lui-même le mot de passe, aucun email n'est requis.)
    let emailEnvoye: boolean | null = null;
    if (motDePasseGenere) {
      emailEnvoye = await this.mailService.envoyerIdentifiants({
        to: dto.username,
        nomComplet: `${dto.prenom} ${dto.nom}`,
        username: dto.username,
        motDePasse: motDePasseClair,
        role: LIBELLE_TYPE[dto.typePersonne ?? 1] ?? 'Personnel',
      });
      if (!emailEnvoye) {
        throw new ServiceUnavailableException(
          `Compte non créé : impossible d'envoyer les identifiants à "${dto.username}". Vérifiez l'adresse e-mail et réessayez.`,
        );
      }
    }

    const saved = await this.personneRepository.save(personne);

    // On expose le statut d'envoi pour que le frontend puisse informer
    (saved as any).emailEnvoye = emailEnvoye;
    return saved;
  }

  /**
   * Lister toutes les personnes de type Professeur (typePersonne = 1)
   */
  async findAllPersonnes(): Promise<Personne[]> {
    return this.personneRepository.find({
      where: { typePersonne: 1,
          isDelete: 0
    },
      order: { nom: 'ASC' },
    });
  }

  /** Lister toutes les personnes, tous types confondus (pour choisir un expéditeur de message) */
  async findAllPersonnesTous(): Promise<Personne[]> {
    return this.personneRepository.find({
        where: { isDelete: 0 },
        order: { nom: 'ASC' } });
  }

  /**
   * Supprimer un compte Personne (membre du personnel ou parent).
   * On retire d'abord ses liens directs (enseignant, titulaire).
   */
  async removePersonne(idPers: number, force: boolean = false): Promise<{ message: string }> {
    const personne = await this.personneRepository.findOne({ where: { idPers, isDelete: 0 } });
    if (!personne) throw new NotFoundException('Personne introuvable');

    await verifierAvantSuppression(
      this.personneRepository.manager,
      `le compte "${personne.nom} ${personne.prenom}"`,
      [
        { entity: Enseignant, where: { personne: { idPers } }, label: (n) => `${n} rôle(s) enseignant` },
        { entity: Titulaire, where: { personne: { idPers } }, label: (n) => `${n} rôle(s) titulaire` },
        { entity: Parents, where: { personne: { idPers } }, label: (n) => `${n} liaison(s) parent` },
        { entity: Residents, where: { personne: { idPers } }, label: (n) => `${n} adresse(s) résidente` },
      ],
      force,
      "Désactivez-le plutôt si vous souhaitez conserver l'historique (notes, messages, paiements, etc)."
    );

    await this.personneRepository.manager.transaction(async (m) => {
      // Si force = true ou s'il n'y a pas de dépendances bloquantes, 
      // verifierAvantSuppression se charge de mettre à jour `isDelete = 1` 
      // pour les entités dépendantes listées. 
      // Il ne reste qu'à supprimer la personne elle-même.
      personne.isDelete = 1;
      // Libérer le username (email) en ajoutant un suffixe _DELETED_<timestamp>
      personne.username = `${personne.username}_DELETED_${Date.now()}`;
      await m.save(personne);
    });

    return { message: 'Compte supprimé' };
  }

  /**
   * Trouver une personne par son id
   */
  async findPersonneById(idPers: number): Promise<Personne> {
    const personne = await this.personneRepository.findOne({
      where: { idPers,
          isDelete: 0
    },
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
        where: { username: dto.username,
            isDelete: 0
        },
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
      where: { personne: { idPers: dto.idPers },
          isDelete: 0
    },
    });
    if (exists) {
      throw new ConflictException('Cette personne est déjà enregistrée comme enseignant');
    }

    // L'enseignant est créé SANS classe : sa classe vient du titulariat.

    // Matière de difficulté (cours qu'il ne donne pas) — optionnelle
    let cours: Cours | undefined = undefined;
    if (dto.idCours) {
      const c = await this.coursRepository.findOne({ where: { idCours: dto.idCours,
          isDelete: 0
    } });
      if (!c) throw new NotFoundException(`Cours introuvable (id: ${dto.idCours})`);
      cours = c;
    }

    const enseignant = this.enseignantRepository.create({
      personne,
      cours,
      actif: 1, // ✅ minuscule corrigé
    });

    // Admin : fourni, sinon l'admin racine par défaut (idAdmin NOT NULL en BD)
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
    if (admin) enseignant.admin = admin;

    return this.enseignantRepository.save(enseignant);
  }

  /**
   * Définir (ou effacer) la « matière de difficulté » d'un enseignant.
   * Écrit uniquement la colonne existante idCours — aucune modif de schéma.
   * La matière doit appartenir à la classe de l'enseignant.
   */
  async setMatiereDifficulte(idEnseignant: number, idCours: number | null): Promise<Enseignant> {
    const ens = await this.enseignantRepository.findOne({ where: { idEnseignant,
        isDelete: 0
    } });
    if (!ens) throw new NotFoundException(`Enseignant introuvable (id: ${idEnseignant})`);

    if (idCours == null) {
      ens.cours = null as any; // efface la matière de difficulté
    } else {
      const cours = await this.coursRepository.findOne({ where: { idCours,
          isDelete: 0
    } });
      if (!cours) throw new NotFoundException(`Cours introuvable (id: ${idCours})`);
      // L'enseignant n'a plus de classe propre (elle vient du titulariat) :
      // on accepte n'importe quel cours valide comme matière de difficulté.
      ens.cours = cours;
    }
    return this.enseignantRepository.save(ens);
  }

  /**
   * Lister tous les enseignants
   */
  async findAllEnseignants(): Promise<Enseignant[]> {
    return this.enseignantRepository.find({
        where: { isDelete: 0 },
        relations: ['personne'], // classe.salles → affichage « Classe X · Salle Y »
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Lister les enseignants actifs
   */
  async findEnseignantsActifs(): Promise<Enseignant[]> {
    return this.enseignantRepository.find({
      where: { actif: 1,
          isDelete: 0
    }, // ✅ minuscule corrigé
      relations: ['personne'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Trouver un enseignant par son id
   */
  async findEnseignantById(idEnseignant: number): Promise<Enseignant> {
    const enseignant = await this.enseignantRepository.findOne({
      where: { idEnseignant,
          isDelete: 0
    },
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
  async removeEnseignant(idEnseignant: number, force: boolean = false): Promise<{ message: string }> {
    const enseignant = await this.findEnseignantById(idEnseignant);
    enseignant.isDelete = 1;
    await this.enseignantRepository.save(enseignant);
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
      where: { personne: { idPers: dto.idPers },
          isDelete: 0
    },
    });
    if (exists) {
      throw new ConflictException('Cette personne est déjà enregistrée comme titulaire');
    }

    // idSalle est NOT NULL en BD
    const salle = await this.salleRepository.findOne({ where: { idSalle: dto.idSalle,
        isDelete: 0
    } });
    if (!salle) throw new NotFoundException(`Salle introuvable (id: ${dto.idSalle})`);

    // Une salle ne peut avoir qu'UN SEUL titulaire actif
    const dejaTitulaire = await this.titulaireRepository.findOne({
      where: { salle: { idSalle: dto.idSalle }, actif: 1,
          isDelete: 0
    },
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
    if (admin) titulaire.admin = admin;

    return this.titulaireRepository.save(titulaire);
  }

  /**
   * Modifier la salle d'un titulaire (réaffectation).
   */
  async updateTitulaire(idTitulaire: number, idSalle: number): Promise<Titulaire> {
    const titulaire = await this.titulaireRepository.findOne({
      where: { idTitulaire,
          isDelete: 0
    },
      relations: ['personne', 'salle'],
    });
    if (!titulaire) throw new NotFoundException(`Titulaire introuvable (id: ${idTitulaire})`);
    const salle = await this.salleRepository.findOne({ where: { idSalle,
        isDelete: 0
    } });
    if (!salle) throw new NotFoundException(`Salle introuvable (id: ${idSalle})`);

    // La nouvelle salle ne doit pas déjà avoir un autre titulaire actif
    if (Number(titulaire.salle?.idSalle) !== Number(idSalle)) {
      const deja = await this.titulaireRepository.findOne({
        where: { salle: { idSalle }, actif: 1,
            isDelete: 0
        },
      });
      if (deja && Number(deja.idTitulaire) !== Number(idTitulaire)) {
        throw new ConflictException("Cette salle a déjà un titulaire actif.");
      }
    }
    titulaire.salle = salle;
    return this.titulaireRepository.save(titulaire);
  }

  /**
   * Lister tous les titulaires
   */
  async findAllTitulaires(): Promise<Titulaire[]> {
    return this.titulaireRepository.find({
        where: { isDelete: 0 },
        relations: ['personne'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Trouver un titulaire par son id
   */
  async findTitulaireById(idTitulaire: number): Promise<Titulaire> {
    const titulaire = await this.titulaireRepository.findOne({
      where: { idTitulaire,
          isDelete: 0
    },
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
  async removeTitulaire(idTitulaire: number, force: boolean = false): Promise<{ message: string }> {
    const titulaire = await this.findTitulaireById(idTitulaire);
    titulaire.isDelete = 1;
    await this.titulaireRepository.save(titulaire);
    return { message: `Titulaire id ${idTitulaire} supprimé` };
  }

  /**
   * Recherche d'un enseignant par nom ou prénom
   */
  async search(query: string): Promise<Personne[]> {
    return this.personneRepository
      .createQueryBuilder('personne')
      .where('personne.typePersonne = :type', { type: 1 })
      .andWhere('personne.nom LIKE :q OR personne.prenom LIKE :q', {
        q: `%${query}%`,
      })
      .orderBy('personne.nom', 'ASC')
      .getMany();
  }
}