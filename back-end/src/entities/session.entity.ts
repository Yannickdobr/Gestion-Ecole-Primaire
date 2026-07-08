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
@Entity('session')
export class Session {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idSession: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  date_passage: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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