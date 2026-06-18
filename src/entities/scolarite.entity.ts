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
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idScolarite: number;

  @Column({ type: 'float', unsigned: true })
  inscription: number; // frais d'inscription

  @Column({ type: 'float', unsigned: true })
  pension: number; // frais de pension annuels

  @Column({ type: 'smallint', unsigned: true, default: 3 })
  nbreTranche: number; // nombre de tranches de paiement

  @Column({ type: 'tinytext' })
  description: string;

  @Column({ type: 'int', unsigned: true })
  idFondateur: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────



  @ManyToOne(() => Cycle, { eager: true, nullable: false })
  @JoinColumn({ name: 'idCycle' })
  cycle: Cycle;

  @OneToMany(() => Tranches, (tranche) => tranche.scolarite)
  tranches: Tranches[];
}