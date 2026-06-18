import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Discipline – Discipline scolaire générale
 * Correspond à la table `discipline` du MCD
 */
@Entity('discipline')
export class Discipline {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  ID: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'int', unsigned: true, default: 0 })
  points: number;
}