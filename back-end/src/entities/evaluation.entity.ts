import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Eleve } from './eleve.entity';
import { Epreuve } from './epreuve.entity';
import { Cours } from './cours.entity';
import { Session } from './session.entity';
import { Personne } from './personne.entity';

/**
 * Entité Evaluation – Note obtenue par un élève pour une épreuve dans un cours
 * Correspond à la table `evaluation` du MCD
 */
@Entity('evaluation')
export class Evaluation {
  @PrimaryGeneratedColumn({ type: 'int' })
  idEval: number;

  @Column({ type: 'real', default: 0 })
  note: number;

  @Column({ type: 'varchar', length: 255 })
  appreciation: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Eleve, { eager: true, nullable: false })
  @JoinColumn({ name: 'matricule' })
  eleve: Eleve;

  @ManyToOne(() => Epreuve, (epreuve) => epreuve.evaluations, { eager: true, nullable: false })
  @JoinColumn({ name: 'idEpreuve' })
  epreuve: Epreuve;

  @ManyToOne(() => Cours, { eager: true, nullable: false })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Session, (session) => session.evaluations, { eager: true, nullable: false })
  @JoinColumn({ name: 'idSession' })
  session: Session;

  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  saisirPar: Personne; // enseignant qui a saisi la note
}
