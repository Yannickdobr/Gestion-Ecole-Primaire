import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scolarite } from './scolarite.entity';

/**
 * Entité Tranches – Découpage des paiements en plusieurs versements
 * Correspond à la table `tranches` du MCD
 */
@Entity('tranches')
export class Tranches {
  @PrimaryGeneratedColumn({ type: 'int' })
  idTranche: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'real', default: 0 })
  montant: number;

  @Column({ type: 'char', length: 2 })
  delai_mois: string; // ex: "09" pour septembre

  @Column({ type: 'char', length: 2 })
  delai_jour: string; // ex: "15" pour le 15

  @Column({ type: 'smallint', default: 1 })
  actif: number;

  @Column({ type: 'int' })
  idFondateur: number;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Scolarite, (scolarite) => scolarite.tranches, { nullable: false })
  @JoinColumn({ name: 'idScolarite' })
  scolarite: Scolarite;
}