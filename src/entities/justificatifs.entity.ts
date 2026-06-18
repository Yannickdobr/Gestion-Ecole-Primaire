import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * Entité Justificatifs – Documents justificatifs liés aux rapports
 */
@Entity('Justificatifs')
export class Justificatifs {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  ID: number;

  @Column({ type: 'int', unsigned: true })
  idRapport: number;

  @Column({ type: 'text' })
  commentaire: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  idDirecteur: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  urlDoc: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
