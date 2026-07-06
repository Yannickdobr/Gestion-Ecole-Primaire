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
import { Livres } from './livres.entity';

/**
 * Entité Cours – Matière ou discipline enseignée dans une classe
 * Correspond à la table `cours` du MCD
 */
@Entity('cours')
export class Cours {
  @PrimaryGeneratedColumn({ type: 'int' })
  idCours: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'real', default: 0 })
  note: number; // note de passage

  @Column({ type: 'real', default: 1 })
  coefficient: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'smallint', default: 1 })
  actif: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Classe, { eager: true, nullable: false })
  @JoinColumn({ name: 'idClasse' })
  classe: Classe;

  // Livre associé au cours (FK idLivre). Nullable : pas toujours renseigné.
  @ManyToOne(() => Livres, { eager: true, nullable: true })
  @JoinColumn({ name: 'idLivre' })
  livre: Livres | null;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}