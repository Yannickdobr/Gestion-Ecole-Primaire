import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Quartier – Quartier géographique de résidence
 */
@Entity('quartier')
export class Quartier {
  @PrimaryGeneratedColumn({ type: 'int' })
  idQuartier: number;

  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'text' })
  description: string;
}
