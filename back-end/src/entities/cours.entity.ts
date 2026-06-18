import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Classe } from './classe.entity';

/**
 * Entité Cours – Matière ou discipline enseignée dans une classe
 * Correspond à la table `cours` du MCD
 */
@Entity('cours')
export class Cours {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idCours: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'float', unsigned: true, default: 0 })
  note: number; // note de passage

  @Column({ type: 'float', unsigned: true, default: 1 })
  coefficient: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1 })
  actif: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Classe, { eager: true, nullable: false })
  @JoinColumn({ name: 'idClasse' })
  classe: Classe;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}