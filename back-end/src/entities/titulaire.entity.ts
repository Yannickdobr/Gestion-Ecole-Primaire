import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Admin } from './admin.entity';
import { Salle } from './salle.entity';

/**
 * Entité Titulaire – Professeur titulaire d'une salle / classe
 * Correspond à la table `titulaire` du MCD
 * ✅ CORRECTION ERREUR 3 : relation ManyToOne vers Salle ajoutée (association "responsable" du MCD)
 */
@Entity('titulaire')
export class Titulaire {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idTitulaire: number;

  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1 })
  actif: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => Personne, { eager: true, nullable: false })
  @JoinColumn({ name: 'idPers' })
  personne: Personne;

  // ✅ CORRECTION ERREUR 3 : relation vers Salle (association "responsable" du MCD)
  @ManyToOne(() => Salle, { eager: true, nullable: false })
  @JoinColumn({ name: 'idSalle' })
  salle: Salle;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}
