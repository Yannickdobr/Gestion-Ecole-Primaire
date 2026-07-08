import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
    ForbiddenException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
  import { Admin } from '../entities/admin.entity';
  import { Personne } from '../entities/personne.entity';
  import { LoginDto } from './dto/login.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  import { CreateAdminDto } from './dto/create-admin.dto';
  import { MailService } from '../mail/mail.service';

  // Mot de passe provisoire lisible (sans caractères ambigus)
  function genererMotDePasse(longueur = 10): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let p = '';
    for (let i = 0; i < longueur; i++) p += chars[Math.floor(Math.random() * chars.length)];
    return p;
  }

  const LIBELLE_ADMIN: Record<number, string> = { 1: 'Admin', 2: 'Fondateur', 3: 'Directeur' };

  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(Admin)
      private adminRepository: Repository<Admin>,

      @InjectRepository(Personne)
      private personneRepository: Repository<Personne>,

      private jwtService: JwtService,

      private readonly mailService: MailService,
    ) {}
  
    /**
     * Authentification unifiée :
     * 1. Cherche d'abord dans la table Admin
     * 2. Si non trouvé, cherche dans la table Personne
     * 3. Vérifie le mot de passe avec bcrypt
     * 4. Retourne un token JWT avec le rôle
     */
    async login(loginDto: LoginDto) {
      const { username, password } = loginDto;
  
      // ── Recherche dans Admin ──────────────────────────────────────────
      const admin = await this.adminRepository.findOne({
        where: { username, actif: 1,
            isDelete: 0
        },
      });
  
      if (admin) {
        let passwordValid = await bcrypt.compare(password, admin.password);
        if (!passwordValid) {
          // Fallback en cas d'espace copié par erreur depuis l'email
          passwordValid = await bcrypt.compare(password.trim(), admin.password);
        }
        
        if (!passwordValid) {
          console.log(`[LOGIN ERROR] Echec pour Admin: ${username}`);
          console.log(`[LOGIN ERROR] Mot de passe saisi (longueur): ${password.length}, après trim: ${password.trim().length}`);
          console.log(`[LOGIN ERROR] Saisi: "${password}", Saisi Trimmed: "${password.trim()}"`);
        } else {
          console.log(`[LOGIN SUCCESS] Connexion réussie pour Admin: ${username}`);
          const payload = {
            sub: admin.ID,
            username: admin.username,
            role: 'admin',
            typeRole: admin.typeAdmin, // 0=root, 1=Admin, 2=Fondateur, 3=Directeur
          };
    
          return {
            access_token: this.jwtService.sign(payload),
            user: {
              id: admin.ID,
              nom: admin.nom,
              username: admin.username,
              role: 'admin',
              typeRole: admin.typeAdmin,
            },
          };
        }
        // Si le mot de passe Admin est incorrect, on ne jette pas d'erreur tout de suite.
        // L'utilisateur existe peut-être AUSSI dans la table Personne avec ce mot de passe.
      }
  
      // ── Recherche dans Personne ───────────────────────────────────────
      const personne = await this.personneRepository.findOne({
        where: { username,
            isDelete: 0
        },
      });
  
      if (!personne) {
        throw new NotFoundException(
          `Aucun utilisateur trouvé avec le nom d'utilisateur "${username}"`,
        );
      }
  
      let passwordValid = await bcrypt.compare(password, personne.password);
      if (!passwordValid) {
        // Fallback en cas d'espace copié par erreur depuis l'email
        passwordValid = await bcrypt.compare(password.trim(), personne.password);
      }
      if (!passwordValid) {
        console.log(`[LOGIN ERROR] Echec pour Personne: ${username}`);
        console.log(`[LOGIN ERROR] Mot de passe saisi (longueur): ${password.length}, après trim: ${password.trim().length}`);
        console.log(`[LOGIN ERROR] Saisi: "${password}", Saisi Trimmed: "${password.trim()}"`);
        throw new UnauthorizedException('Mot de passe incorrect');
      }
  
      console.log(`[LOGIN SUCCESS] Connexion réussie pour Personne: ${username}`);
      const payload = {
        sub: personne.idPers,
        username: personne.username,
        role: 'personne',
        typeRole: personne.typePersonne, // 1=Enseignant, 2=Administratif, 3=Scolarité, 4=Parents, 5=Autres
      };
  
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: personne.idPers,
          nom: `${personne.prenom} ${personne.nom}`,
          username: personne.username,
          role: 'personne',
          typeRole: personne.typePersonne,
        },
      };
    }
  
    /**
     * Renouvelle le token du compte connecté (session glissante).
     * Permet de prolonger la session sans redemander les identifiants,
     * tant que le token courant est encore valide (vérifié par JwtAuthGuard).
     */
    refresh(user: { id: number; username: string; role: string; typeRole: number }) {
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        typeRole: user.typeRole,
      };
      return { access_token: this.jwtService.sign(payload) };
    }

    /**
     * Mot de passe oublié : régénère un mot de passe et l'envoie par email.
     * (Sans table de tokens — on réinitialise directement la colonne password.)
     * Réponse TOUJOURS générique pour ne pas révéler l'existence d'un compte.
     */
    async forgotPassword(username: string): Promise<{ message: string }> {
      const generique = {
        message:
          "Si un compte correspond à cet identifiant, un nouveau mot de passe vient d'être envoyé par email.",
      };
      if (!username) return generique;

      const admin = await this.adminRepository.findOne({ where: { username,
          isDelete: 0
    } });
      const personne = admin ? null : await this.personneRepository.findOne({ where: { username,
          isDelete: 0
    } });
      if (!admin && !personne) return generique;

      const nouveau = genererMotDePasse();
      const hash = await bcrypt.hash(nouveau, 10);

      let nomComplet: string;
      let role: string;
      if (admin) {
        admin.password = hash;
        await this.adminRepository.save(admin);
        nomComplet = admin.nom;
        role = 'Administrateur';
      } else {
        personne!.password = hash;
        await this.personneRepository.save(personne!);
        nomComplet = `${personne!.prenom} ${personne!.nom}`;
        role = 'Personnel';
      }

      // username = email (pour les Personnes c'est garanti) → on envoie le nouveau mdp
      await this.mailService
        .envoyerIdentifiants({ to: username, nomComplet, username, motDePasse: nouveau, role })
        .catch(() => {});

      return generique;
    }

    /**
     * Utilitaire : hash d'un mot de passe en clair
     * À utiliser lors de la création d'un Admin ou d'une Personne
     */
    async hashPassword(plainPassword: string): Promise<string> {
      return bcrypt.hash(plainPassword, 10);
    }
  
    /**
     * Crée le premier compte Admin (seed initial)
     * À appeler une seule fois lors de l'initialisation
     */
    async createFirstAdmin(nom: string, username: string, password: string) {
      // Vérifier si l'utilisateur existe déjà avec ce username
      const exists = await this.adminRepository.findOne({ where: { username,
          isDelete: 0
    } });
      if (exists) {
        return { message: 'Admin déjà existant' };
      }
    
      const hashedPassword = await this.hashPassword(password);
      const admin = this.adminRepository.create({
        nom: nom,
        username: username,
        password: hashedPassword,
        actif: 1,
        typeAdmin: 0, // 0 = root (super administrateur)
        mobile: '000', // champs NOT NULL en BD — valeur par défaut
        alanyaID: '000',
      });
    
      await this.adminRepository.save(admin);
      return { message: 'Premier admin créé avec succès', username };
    }

    /**
     * Change le mot de passe de l'utilisateur connecté (Admin ou Personne)
     */
    async changePassword(
      user: { id: number; role: string },
      dto: ChangePasswordDto,
    ) {
      if (user.role === 'admin') {
        const admin = await this.adminRepository.findOne({ where: { ID: user.id,
            isDelete: 0
        } });
        if (!admin) throw new NotFoundException('Compte introuvable');
        const ok = await bcrypt.compare(dto.ancienMotDePasse, admin.password);
        if (!ok) throw new UnauthorizedException('Ancien mot de passe incorrect');
        admin.password = await bcrypt.hash(dto.nouveauMotDePasse, 10);
        await this.adminRepository.save(admin);
      } else {
        const personne = await this.personneRepository.findOne({ where: { idPers: user.id,
            isDelete: 0
        } });
        if (!personne) throw new NotFoundException('Compte introuvable');
        const ok = await bcrypt.compare(dto.ancienMotDePasse, personne.password);
        if (!ok) throw new UnauthorizedException('Ancien mot de passe incorrect');
        personne.password = await bcrypt.hash(dto.nouveauMotDePasse, 10);
        await this.personneRepository.save(personne);
      }
      return { message: 'Mot de passe modifié avec succès' };
    }

    /**
     * Lister les comptes administrateurs selon la visibilité du demandeur.
     * Root (0) et Fondateur (2) voient TOUS les admins ; les autres voient
     * uniquement les admins de LEUR type.
     */
    async listAdmins(user: { role: string; typeRole: number }) {
      const tous = await this.adminRepository.find({
          where: { isDelete: 0 },
        order: { ID: 'ASC' } });
      if (user?.role !== 'admin') return [];
      if ([0, 2].includes(Number(user.typeRole))) return tous;
      return tous.filter((a) => Number(a.typeAdmin) === Number(user.typeRole));
    }

    /**
     * Supprimer un administrateur — réservé au Root (0) et au Fondateur (2).
     * On ne peut pas supprimer son propre compte.
     */
    async removeAdmin(targetId: number, user: { id: number; role: string; typeRole: number }) {
      if (!(user?.role === 'admin' && [0, 2].includes(Number(user.typeRole)))) {
        throw new ForbiddenException('Seuls le Root et le Fondateur peuvent supprimer un administrateur.');
      }
      if (Number(targetId) === Number(user.id)) {
        throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte.');
      }
      const admin = await this.adminRepository.findOne({ where: { ID: targetId,
          isDelete: 0
    } });
      if (!admin) throw new NotFoundException('Administrateur introuvable');
      // Le compte Root (typeAdmin 0) est protégé : personne ne peut le supprimer.
      if (Number(admin.typeAdmin) === 0) {
        throw new ForbiddenException('Le compte Root est protégé et ne peut pas être supprimé.');
      }
      try {
        admin.isDelete = 1;
        await this.adminRepository.save(admin);
      } catch {
        throw new ConflictException("Suppression impossible : cet administrateur est lié à des données.");
      }
      return { message: 'Administrateur supprimé' };
    }

    /**
     * Créer un compte administrateur, selon la hiérarchie :
     *  - Root (0)      → peut créer Fondateur (2), Directeur (3)
     *  - Fondateur (2) → peut créer Directeur (3)
     *  - autres        → interdit
     * « Admin standard » (1) n'est plus créable : les tâches de saisie
     * administrative relèvent du Personnel (Administratif / Scolarité).
     * Le mot de passe est généré et envoyé par email.
     */
    async createAdmin(dto: CreateAdminDto, user: { role: string; typeRole: number }) {
      if (!(user?.role === 'admin' && [0, 2].includes(Number(user.typeRole)))) {
        throw new ForbiddenException('Seuls le Root et le Fondateur peuvent créer des comptes administrateurs.');
      }
      const autorises = Number(user.typeRole) === 0 ? [2, 3] : [3];
      if (!autorises.includes(Number(dto.typeAdmin))) {
        throw new ForbiddenException("Vous n'êtes pas autorisé à créer ce type de compte.");
      }

      const exists = await this.adminRepository.findOne({ where: { username: dto.username,
          isDelete: 0
    } });
      if (exists) throw new ConflictException(`L'identifiant "${dto.username}" est déjà utilisé`);

      const motDePasseClair = genererMotDePasse();
      const hashedPassword = await bcrypt.hash(motDePasseClair, 10);

      const admin = this.adminRepository.create({
        nom: dto.nom,
        username: dto.username,
        password: hashedPassword,
        actif: 1,
        typeAdmin: Number(dto.typeAdmin),
        mobile: dto.mobile ?? '000', // NOT NULL en BD
        alanyaID: '000', // NOT NULL en BD
      });
      const saved = await this.adminRepository.save(admin);

      const emailEnvoye = await this.mailService.envoyerIdentifiants({
        to: dto.username,
        nomComplet: dto.nom,
        username: dto.username,
        motDePasse: motDePasseClair,
        role: LIBELLE_ADMIN[Number(dto.typeAdmin)] ?? 'Administrateur',
      });
      (saved as any).emailEnvoye = emailEnvoye;
      return saved;
    }
  }