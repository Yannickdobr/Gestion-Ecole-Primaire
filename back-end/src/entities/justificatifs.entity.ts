import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entité Justificatifs – Documents justificatifs liés aux rapports
 */
@Entity('justificatifs')
export class Justificatifs {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  ID: number;

  @Column({ type: 'int' })
  idRapport: number;

  @Column({ type: 'text' })
  commentaire: string;

  @Column({ type: 'int', nullable: true })
  idDirecteur: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  urlDoc: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
