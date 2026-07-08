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
@Entity('residents')
export class Residents {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idResi: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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
