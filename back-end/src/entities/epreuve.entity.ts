import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { NatureEpreuve } from './nature-epreuve.entity';
import { Personne } from './personne.entity';
import { Evaluation } from './evaluation.entity';

/**
 * Entité Epreuve – Épreuve d'évaluation rattachée à une session
 * Correspond à la table `epreuve` du MCD
 */
@Entity('epreuve')
export class Epreuve {
  @PrimaryGeneratedColumn({ type: 'int' })
  idEpreuve: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
  urlDoc: string;

  @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
  auteur: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => NatureEpreuve, (nature) => nature.epreuves, { eager: true, nullable: false })
  @JoinColumn({ name: 'idNature' })
  nature: NatureEpreuve;

  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  personne: Personne;

  @OneToMany(() => Evaluation, (evaluation) => evaluation.epreuve)
  evaluations: Evaluation[];
}
