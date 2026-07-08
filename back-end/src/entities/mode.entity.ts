import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { Paiement } from './paiement.entity';

@Entity('mode')
export class Mode {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idMode: number;

  @Column({ type: 'varchar', length: 100, default: 'INDEFINI' })
  libelle: string;

  @Column({ type: 'text' })
  information: string;

  @Column({ type: 'smallint', default: 1 })
  actif: number;

  @Column({ type: 'int' })
  idFondateur: number;

  // ✅ FIX: created_at présent dans la BD mais manquait dans l'entity
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Paiement, (paiement) => paiement.mode)
  paiements: Paiement[];
}