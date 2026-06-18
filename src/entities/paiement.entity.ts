import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Eleve } from './eleve.entity';
import { AnneeAcademique } from './annee-academique.entity';
import { Mode } from './mode.entity';
import { Personne } from './personne.entity';

/**
 * Entité Paiement
 * ✅ FIX: "comentaire" (typo BD avec 1 seul 'm') mappé via name
 * ✅ FIX: "dateEnregistrer" est le vrai nom de la colonne dans la BD
 */
@Entity('Paiement')
export class Paiement {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idPaie: number;

  @Column({ type: 'float' })
  montant: number;

  @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
  url: string;

  // ✅ FIX: la BD a "comentaire" avec 1 m (typo) — on mappe proprement
  @Column({ type: 'varchar', length: 255, name: 'comentaire', default: 'INDEFINI' })
  commentaire: string;

  @Column({ type: 'varchar', length: 30, default: 'INDEFINI' })
  operation_ID: string;

  @Column({ type: 'date' })
  datePaie: Date;

  // ✅ FIX: la BD utilise "dateEnregistrer" pas "created_at"
  @Column({ type: 'datetime', name: 'dateEnregistrer', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  dateEnregistrer: Date;

  @ManyToOne(() => Eleve, { eager: true, nullable: false })
  @JoinColumn({ name: 'matricule' })
  eleve: Eleve;

  @ManyToOne(() => AnneeAcademique, { eager: true, nullable: false })
  @JoinColumn({ name: 'idAca' })
  anneeAcademique: AnneeAcademique;

  @ManyToOne(() => Mode, (mode) => mode.paiements, { eager: true, nullable: false })
  @JoinColumn({ name: 'idMode' })
  mode: Mode;

  @ManyToOne(() => Personne, { nullable: false })
  @JoinColumn({ name: 'idPers' })
  enregistrePar: Personne;
}