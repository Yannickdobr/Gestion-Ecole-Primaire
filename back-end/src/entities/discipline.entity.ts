import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Discipline – Discipline scolaire générale
 * Correspond à la table `discipline` du MCD
 */
@Entity('discipline')
export class Discipline {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  ID: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'int', default: 0 })
  points: number;
}