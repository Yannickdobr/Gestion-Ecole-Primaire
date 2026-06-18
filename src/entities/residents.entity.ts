import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Quartier } from './quartier.entity';
import { Admin } from './admin.entity';

/**
 * Entité Residents – Lien entre une Personne et un Quartier
 */
@Entity('Residents')
export class Residents {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idResi: number;

  @Column({ type: 'tinytext' })
  description: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  personne: Personne;

  @ManyToOne(() => Quartier, { nullable: false })
  @JoinColumn({ name: 'idQuartier' })
  quartier: Quartier;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}
