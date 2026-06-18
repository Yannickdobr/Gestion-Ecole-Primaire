import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Eleve } from './eleve.entity';
import { AnneeAcademique } from './annee-academique.entity';
import { Personne } from './personne.entity';

/**
 * Entité Rapport
 * ✅ FIX: idAca est une FK vers AnneeAcademique dans la BD SQL (pas Trimestre)
 * La BD: ALTER TABLE Rapport ADD CONSTRAINT annee FK(idAca) REFERENCES AnneeAcademique(idAnnee)
 */
@Entity('Rapport')
export class Rapport {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idRap: number;

  @Column({ type: 'varchar', length: 100 })
  libelle: string;

  @Column({ type: 'int', unsigned: true })
  points: number;

  @Column({ type: 'text' })
  commentaire: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Eleve, { eager: true, nullable: false })
  @JoinColumn({ name: 'matricule' })
  eleve: Eleve;

  // ✅ FIX: FK vers AnneeAcademique (idAca) comme défini dans la BD
  @ManyToOne(() => AnneeAcademique, { eager: true, nullable: false })
  @JoinColumn({ name: 'idAca' })
  anneeAcademique: AnneeAcademique;

  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  redacteur: Personne;
}