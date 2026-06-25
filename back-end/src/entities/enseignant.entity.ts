import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Admin } from './admin.entity';
import { Cours } from './cours.entity';
import { Salle } from './salle.entity';

@Entity('enseignant')
export class Enseignant {
  @PrimaryGeneratedColumn({ type: 'int' })
  idEnseignant: number;

  // ✅ FIX: SQL a "Actif" avec A majuscule — on spécifie le nom de colonne explicitement
  @Column({ type: 'smallint', default: 1, name: 'Actif' })
  actif: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Personne, { eager: true, nullable: false })
  @JoinColumn({ name: 'idPers' })
  personne: Personne;

  // Salle attribuée à l'enseignant → détermine sa classe (salle.classe, eager).
  // Il y donne toutes les matières (sauf la matière de difficulté ci-dessous).
  @ManyToOne(() => Salle, { eager: true, nullable: true })
  @JoinColumn({ name: 'idSalle' })
  salle: Salle;

  // Matière de DIFFICULTÉ (le cours qu'il NE donne PAS) — optionnel
  @ManyToOne(() => Cours, { eager: true, nullable: true })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}