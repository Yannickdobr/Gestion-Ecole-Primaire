import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Quartier – Quartier géographique de résidence
 */
@Entity('Quartier')
export class Quartier {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idQuartier: number;

  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'tinytext' })
  description: string;
}
