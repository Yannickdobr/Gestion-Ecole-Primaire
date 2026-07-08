import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Admin } from './admin.entity';
  
  /**
   * Entité AnneeAcademique – Année scolaire de référence
   * Correspond à la table `anneeacademique` du MCD
   */
  @Entity('anneeacademique')
  export class AnneeAcademique {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
    @PrimaryGeneratedColumn({ type: 'int' })
    idAnnee: number;
  
    @Column({ type: 'varchar', length: 200 })
    libelle: string;
  
    @Column({ type: 'varchar', length: 255 })
    periode: string;
  
    @CreateDateColumn({ type: 'date' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
  
    @ManyToOne(() => Admin, { nullable: false })
    @JoinColumn({ name: 'idAdmin' })
    admin: Admin;
  }