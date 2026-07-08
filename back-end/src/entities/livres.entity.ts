import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Admin } from './admin.entity';
  import { Specialite } from './specialite.entity';
  
  /**
   * Entité Livres – Catalogue des livres par spécialité
   * Correspond à la table `livres` du MCD
   */
  @Entity('livres')
  export class Livres {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
    @PrimaryGeneratedColumn({ type: 'int' })
    idLivre: number;
  
    @Column({ type: 'varchar', length: 255 })
    titre: string;
  
    @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
    auteurs: string;
  
    @Column({ type: 'real', default: 0 })
    prix: number;
  
    @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
    edition: string;
  
    @Column({ type: 'date', nullable: true })
    annee_parution: Date;
  
    @Column({ type: 'smallint', default: 1 })
    totalCopie: number;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
  
    @ManyToOne(() => Specialite, (spe) => spe.livres, { eager: true, nullable: false })
    @JoinColumn({ name: 'idSpecialite' })
    specialite: Specialite;
  
    @ManyToOne(() => Admin, { nullable: false })
    @JoinColumn({ name: 'idAdmin' })
    admin: Admin;
  }