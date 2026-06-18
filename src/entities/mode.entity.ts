import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Paiement } from './paiement.entity';

@Entity('Mode')
export class Mode {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idMode: number;

  @Column({ type: 'varchar', length: 100, default: 'INDEFINI' })
  libelle: string;

  @Column({ type: 'tinytext' })
  information: string;

  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1 })
  actif: number;

  @Column({ type: 'int', unsigned: true })
  idFondateur: number;

  // ✅ FIX: created_at présent dans la BD mais manquait dans l'entity
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Paiement, (paiement) => paiement.mode)
  paiements: Paiement[];
}