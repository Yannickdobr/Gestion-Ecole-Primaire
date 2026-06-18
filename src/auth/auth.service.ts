import {
    Injectable,
    UnauthorizedException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { JwtService } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
  import { Admin } from '../entities/admin.entity';
  import { Personne } from '../entities/personne.entity';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(Admin)
      private adminRepository: Repository<Admin>,
  
      @InjectRepository(Personne)
      private personneRepository: Repository<Personne>,
  
      private jwtService: JwtService,
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
        where: { username, actif: 1 },
      });
  
      if (admin) {
        const passwordValid = await bcrypt.compare(password, admin.password);
        if (!passwordValid) {
          throw new UnauthorizedException('Mot de passe incorrect');
        }
  
        const payload = {
          sub: admin.ID,
          username: admin.username,
          role: 'admin',
          typeRole: admin.typeAdmin, // 1=SuperAdmin, 2=Admin, 3=Fondateur
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
  
      // ── Recherche dans Personne ───────────────────────────────────────
      const personne = await this.personneRepository.findOne({
        where: { username },
      });
  
      if (!personne) {
        throw new NotFoundException(
          `Aucun utilisateur trouvé avec le nom d'utilisateur "${username}"`,
        );
      }
  
      const passwordValid = await bcrypt.compare(password, personne.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Mot de passe incorrect');
      }
  
      const payload = {
        sub: personne.idPers,
        username: personne.username,
        role: 'personne',
        typeRole: personne.typePersonne, // 2=Prof, 3=Élève, 4=Parent
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
      const exists = await this.adminRepository.findOne({ where: { username } });
      if (exists) {
        return { message: 'Admin déjà existant' };
      }
    
      const hashedPassword = await this.hashPassword(password);
      const admin = this.adminRepository.create({
        nom: nom,                    
        username: username,          
        password: hashedPassword,    
        actif: 1,
        typeAdmin: 1, // SuperAdmin
      });
    
      await this.adminRepository.save(admin);
      return { message: 'Premier admin créé avec succès', username };
    }
  }