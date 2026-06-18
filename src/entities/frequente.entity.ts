import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Salle } from './salle.entity';
import { AnneeAcademique } from './annee-academique.entity';
import { Eleve } from './eleve.entity';

/**
 * Entité Frequente – Association élève–salle–année académique
 * Représente l'affectation d'un élève dans une salle pour une année donnée
 * Correspond à la table `frequente` du MCD
 */
@Entity('frequente')
export class Frequente {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idFrequente: number;

  @Column({ type: 'varchar', length: 255, default: 'RAS' })
  commentaire: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Salle, (salle) => salle.frequentations, { eager: true, nullable: false })
  @JoinColumn({ name: 'idSalle' })
  salle: Salle;

  @ManyToOne(() => AnneeAcademique, { eager: true, nullable: false })
  @JoinColumn({ name: 'idAcademi' })
  anneeAcademique: AnneeAcademique;

  // ✅ CORRECTION ERREUR 1 : utilise la bonne back-référence frequentations
  @ManyToOne(() => Eleve, (eleve) => eleve.frequentations, { eager: true, nullable: false })
  @JoinColumn({ name: 'matricule' })
  eleve: Eleve;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}
