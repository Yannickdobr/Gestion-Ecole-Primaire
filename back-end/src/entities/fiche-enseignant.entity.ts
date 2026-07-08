import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Enseignant } from './enseignant.entity';
import { AnneeAcademique } from './annee-academique.entity';

/**
 * Entité FicheEnseignant – Fiche de suivi/évaluation d'un enseignant
 * Table présente dans la BD mais non mappée
 */
@Entity('ficheenseignant')
export class FicheEnseignant {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idRap: number;

  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int' })
  idAdministratif: number;

  @Column({ type: 'text' })
  commentaire: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Enseignant, { nullable: false })
  @JoinColumn({ name: 'idEnseignant' })
  enseignant: Enseignant;

  @ManyToOne(() => AnneeAcademique, { nullable: false })
  @JoinColumn({ name: 'idAca' })
  anneeAcademique: AnneeAcademique;
}
