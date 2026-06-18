import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Cycle } from '../entities/cycle.entity';
  import { Classe } from '../entities/classe.entity';
  import { Salle } from '../entities/salle.entity';
  import { AnneeAcademique } from '../entities/annee-academique.entity';
  import { Frequente } from '../entities/frequente.entity';
  import { Admin } from '../entities/admin.entity';
  import { Eleve } from '../entities/eleve.entity';
  import {
    CreateCycleDto, UpdateCycleDto,
    CreateClasseDto, UpdateClasseDto,
    CreateSalleDto, UpdateSalleDto,
    CreateAnneeAcademiqueDto, UpdateAnneeAcademiqueDto,
    CreateFrequenterDto,
  } from './dto/classes.dto';
  
  @Injectable()
  export class ClassesService {
    constructor(
      @InjectRepository(Cycle)
      private cycleRepository: Repository<Cycle>,
  
      @InjectRepository(Classe)
      private classeRepository: Repository<Classe>,
  
      @InjectRepository(Salle)
      private salleRepository: Repository<Salle>,
  
      @InjectRepository(AnneeAcademique)
      private anneeRepository: Repository<AnneeAcademique>,
  
      @InjectRepository(Frequente)
      private frequenteRepository: Repository<Frequente>,
  
      @InjectRepository(Admin)
      private adminRepository: Repository<Admin>,
  
      @InjectRepository(Eleve)
      private eleveRepository: Repository<Eleve>,
    ) {}
  
    // ══════════════════════════════════════════════════════════════════════════
    // CYCLES
    // ══════════════════════════════════════════════════════════════════════════
  
    async createCycle(dto: CreateCycleDto): Promise<Cycle> {
      const exists = await this.cycleRepository.findOne({ where: { libelle: dto.libelle } });
      if (exists) throw new ConflictException(`Le cycle "${dto.libelle}" existe déjà`);
  
      const cycle = this.cycleRepository.create({
        libelle: dto.libelle,
        description: dto.description,
      });
      if (dto.idAdmin) {
        const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
        if (admin) cycle.admin = admin;
      }
      return this.cycleRepository.save(cycle);
    }
  
    async findAllCycles(): Promise<Cycle[]> {
      return this.cycleRepository.find({ order: { libelle: 'ASC' } });
    }
  
    async findCycleById(idCycle: number): Promise<Cycle> {
      const cycle = await this.cycleRepository.findOne({
        where: { idCycle },
        relations: ['classes'],
      });
      if (!cycle) throw new NotFoundException(`Cycle introuvable (id: ${idCycle})`);
      return cycle;
    }
  
    async updateCycle(idCycle: number, dto: UpdateCycleDto): Promise<Cycle> {
      const cycle = await this.findCycleById(idCycle);
      if (dto.libelle !== undefined) cycle.libelle = dto.libelle;
      if (dto.description !== undefined) cycle.description = dto.description;
      return this.cycleRepository.save(cycle);
    }
  
    async removeCycle(idCycle: number): Promise<{ message: string }> {
      const cycle = await this.findCycleById(idCycle);
      await this.cycleRepository.remove(cycle);
      return { message: `Cycle "${cycle.libelle}" supprimé` };
    }
  
    // ══════════════════════════════════════════════════════════════════════════
    // CLASSES
    // ══════════════════════════════════════════════════════════════════════════
  
    async createClasse(dto: CreateClasseDto): Promise<Classe> {
      const cycle = await this.cycleRepository.findOne({ where: { idCycle: dto.idCycle } });
      if (!cycle) throw new NotFoundException(`Cycle introuvable (id: ${dto.idCycle})`);
  
      const exists = await this.classeRepository.findOne({
        where: { libelle: dto.libelle, cycle: { idCycle: dto.idCycle } },
      });
      if (exists) throw new ConflictException(`La classe "${dto.libelle}" existe déjà dans ce cycle`);
  
      const classe = this.classeRepository.create({ libelle: dto.libelle, cycle });
      if (dto.idAdmin) {
        const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
        if (admin) classe.admin = admin;
      }
      return this.classeRepository.save(classe);
    }
  
    async findAllClasses(): Promise<Classe[]> {
      return this.classeRepository.find({
        relations: ['cycle'],
        order: { libelle: 'ASC' },
      });
    }
  
    async findClassesByCycle(idCycle: number): Promise<Classe[]> {
      await this.findCycleById(idCycle);
      return this.classeRepository.find({
        where: { cycle: { idCycle } },
        relations: ['cycle'],
        order: { libelle: 'ASC' },
      });
    }
  
    async findClasseById(idClasse: number): Promise<Classe> {
      const classe = await this.classeRepository.findOne({
        where: { idClasse },
        relations: ['cycle', 'salles'],
      });
      if (!classe) throw new NotFoundException(`Classe introuvable (id: ${idClasse})`);
      return classe;
    }
  
    async updateClasse(idClasse: number, dto: UpdateClasseDto): Promise<Classe> {
      const classe = await this.findClasseById(idClasse);
      if (dto.libelle !== undefined) classe.libelle = dto.libelle;
      if (dto.idCycle !== undefined) {
        const cycle = await this.cycleRepository.findOne({ where: { idCycle: dto.idCycle } });
        if (!cycle) throw new NotFoundException(`Cycle introuvable (id: ${dto.idCycle})`);
        classe.cycle = cycle;
      }
      return this.classeRepository.save(classe);
    }
  
    async removeClasse(idClasse: number): Promise<{ message: string }> {
      const classe = await this.findClasseById(idClasse);
      await this.classeRepository.remove(classe);
      return { message: `Classe "${classe.libelle}" supprimée` };
    }
  
    // ══════════════════════════════════════════════════════════════════════════
    // SALLES
    // ══════════════════════════════════════════════════════════════════════════
  
    async createSalle(dto: CreateSalleDto): Promise<Salle> {
      const salle = this.salleRepository.create({
        libelle: dto.libelle,
        position: dto.position,
        surface: dto.surface,
      });
      if (dto.idClasse) {
        const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
        if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);
        salle.classe = classe;
      }
      if (dto.idAdmin) {
        const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
        if (admin) salle.admin = admin;
      }
      return this.salleRepository.save(salle);
    }
  
    async findAllSalles(): Promise<Salle[]> {
      return this.salleRepository.find({
        relations: ['classe', 'classe.cycle'],
        order: { libelle: 'ASC' },
      });
    }
  
    async findSalleById(idSalle: number): Promise<Salle> {
      const salle = await this.salleRepository.findOne({
        where: { idSalle },
        relations: ['classe', 'classe.cycle'],
      });
      if (!salle) throw new NotFoundException(`Salle introuvable (id: ${idSalle})`);
      return salle;
    }
  
    async updateSalle(idSalle: number, dto: UpdateSalleDto): Promise<Salle> {
      const salle = await this.findSalleById(idSalle);
      if (dto.libelle !== undefined) salle.libelle = dto.libelle;
      if (dto.position !== undefined) salle.position = dto.position;
      if (dto.surface !== undefined) salle.surface = dto.surface;
      if (dto.idClasse !== undefined) {
        const classe = await this.classeRepository.findOne({ where: { idClasse: dto.idClasse } });
        if (!classe) throw new NotFoundException(`Classe introuvable (id: ${dto.idClasse})`);
        salle.classe = classe;
      }
      return this.salleRepository.save(salle);
    }
  
    async removeSalle(idSalle: number): Promise<{ message: string }> {
      const salle = await this.findSalleById(idSalle);
      await this.salleRepository.remove(salle);
      return { message: `Salle "${salle.libelle}" supprimée` };
    }
  
    // ══════════════════════════════════════════════════════════════════════════
    // ANNÉES ACADÉMIQUES
    // ══════════════════════════════════════════════════════════════════════════
  
    async createAnnee(dto: CreateAnneeAcademiqueDto): Promise<AnneeAcademique> {
      const exists = await this.anneeRepository.findOne({ where: { libelle: dto.libelle } });
      if (exists) throw new ConflictException(`L'année "${dto.libelle}" existe déjà`);
  
      const annee = this.anneeRepository.create({
        libelle: dto.libelle,
        periode: dto.periode,
      });
      if (dto.idAdmin) {
        const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
        if (admin) annee.admin = admin;
      }
      return this.anneeRepository.save(annee);
    }
  
    async findAllAnnees(): Promise<AnneeAcademique[]> {
      return this.anneeRepository.find({ order: { libelle: 'DESC' } });
    }
  
    async findAnneeById(idAnnee: number): Promise<AnneeAcademique> {
      const annee = await this.anneeRepository.findOne({ where: { idAnnee } });
      if (!annee) throw new NotFoundException(`Année académique introuvable (id: ${idAnnee})`);
      return annee;
    }
  
    async updateAnnee(idAnnee: number, dto: UpdateAnneeAcademiqueDto): Promise<AnneeAcademique> {
      const annee = await this.findAnneeById(idAnnee);
      if (dto.libelle !== undefined) annee.libelle = dto.libelle;
      if (dto.periode !== undefined) annee.periode = dto.periode;
      return this.anneeRepository.save(annee);
    }
  
    async removeAnnee(idAnnee: number): Promise<{ message: string }> {
      const annee = await this.findAnneeById(idAnnee);
      await this.anneeRepository.remove(annee);
      return { message: `Année "${annee.libelle}" supprimée` };
    }
  
    // ══════════════════════════════════════════════════════════════════════════
    // FREQUENTE (affectation élève → salle → année)
    // ══════════════════════════════════════════════════════════════════════════
  
    async affecter(dto: CreateFrequenterDto): Promise<Frequente> {
      const salle = await this.findSalleById(dto.idSalle);
      const annee = await this.findAnneeById(dto.idAcademi);
      const eleve = await this.eleveRepository.findOne({ where: { matricule: dto.matricule } });
      if (!eleve) throw new NotFoundException(`Élève introuvable (matricule: ${dto.matricule})`);
  
      // Vérifier qu'il n'est pas déjà affecté dans cette salle pour cette année
      const exists = await this.frequenteRepository.findOne({
        where: {
          eleve: { matricule: dto.matricule },
          anneeAcademique: { idAnnee: dto.idAcademi },
        },
      });
      if (exists) throw new ConflictException('Cet élève est déjà affecté pour cette année académique');
  
      const frequente = this.frequenteRepository.create({
        salle,
        anneeAcademique: annee,
        eleve,
        commentaire: dto.commentaire,
      });
      if (dto.idAdmin) {
        const admin = await this.adminRepository.findOne({ where: { ID: dto.idAdmin } });
        if (admin) frequente.admin = admin;
      }
      return this.frequenteRepository.save(frequente);
    }
  
    async findFrequenterByEleve(matricule: number): Promise<Frequente[]> {
      return this.frequenteRepository.find({
        where: { eleve: { matricule } },
        relations: ['salle', 'salle.classe', 'anneeAcademique'],
        order: { created_at: 'DESC' },
      });
    }
  
    async findFrequenterBySalle(idSalle: number): Promise<Frequente[]> {
      return this.frequenteRepository.find({
        where: { salle: { idSalle } },
        relations: ['eleve', 'anneeAcademique'],
        order: { created_at: 'DESC' },
      });
    }
  
    async removeAffectation(idFrequente: number): Promise<{ message: string }> {
      const frequente = await this.frequenteRepository.findOne({ where: { idFrequente } });
      if (!frequente) throw new NotFoundException(`Affectation introuvable (id: ${idFrequente})`);
      await this.frequenteRepository.remove(frequente);
      return { message: `Affectation id ${idFrequente} supprimée` };
    }
  }