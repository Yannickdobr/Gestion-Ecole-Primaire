import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Epreuve } from './epreuve.entity';

/**
 * Entité NatureEpreuve – Catégorie de l'épreuve (CC, examen, rattrapage…)
 * Correspond à la table `natureepreuve` du MCD
 */
@Entity('natureepreuve')
export class NatureEpreuve {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idNature: number;

  @Column({ type: 'varchar', length: 255, default: 'INDEFINI', comment: 'Controle Continu, Examen, Devoir Mercredi, Devoir Week End' })
  libelle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ─── Relations ────────────────────────────────────────────────────────

  @OneToMany(() => Epreuve, (epreuve) => epreuve.nature)
  epreuves: Epreuve[];
}
