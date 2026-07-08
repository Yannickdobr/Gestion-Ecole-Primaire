import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité Quartier – Quartier géographique de résidence
 */
@Entity('quartier')
export class Quartier {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idQuartier: number;

  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'text' })
  description: string;
}
