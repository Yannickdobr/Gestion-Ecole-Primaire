import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Trimestre } from './trimestre.entity';
import { Evaluation } from './evaluation.entity';
import { Personne } from './personne.entity';

/**
 * Entité Session
 * ✅ FIX: ajout de idPers (FK Personne) et created_at présents dans la BD
 */
@Entity('Session')
export class Session {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idSession: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'tinytext', nullable: true })
  description: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Trimestre, (trimestre) => trimestre.sessions, { eager: true, nullable: false })
  @JoinColumn({ name: 'idTrimestre' })
  trimestre: Trimestre;

  // ✅ FIX: idPers présent dans la BD mais manquait dans l'entity
  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  responsable: Personne;

  @OneToMany(() => Evaluation, (evaluation) => evaluation.session)
  evaluations: Evaluation[];
}