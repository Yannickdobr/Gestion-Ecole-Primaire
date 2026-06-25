import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Cycle } from './cycle.entity';
import { Tranches } from './tranches.entity';

/**
 * Entité Scolarite – Paramètres financiers de scolarité par cycle
 * Correspond à la table `scolarite` du MCD
 */
@Entity('scolarite')
export class Scolarite {
  @PrimaryGeneratedColumn({ type: 'int' })
  idScolarite: number;

  @Column({ type: 'real' })
  inscription: number; // frais d'inscription

  @Column({ type: 'real' })
  pension: number; // frais de pension annuels

  @Column({ type: 'smallint', default: 3 })
  nbreTranche: number; // nombre de tranches de paiement

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  idFondateur: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────



  @ManyToOne(() => Cycle, { eager: true, nullable: false })
  @JoinColumn({ name: 'idCycle' })
  cycle: Cycle;

  @OneToMany(() => Tranches, (tranche) => tranche.scolarite)
  tranches: Tranches[];
}