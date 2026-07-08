import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Admin } from './admin.entity';
import { Cours } from './cours.entity';

@Entity('enseignant')
export class Enseignant {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
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

  // NB : l'enseignant n'a PAS de classe propre. Sa classe se déduit du
  // titulariat (Titulaire.idPers -> Salle -> Classe). Seuls les enseignants
  // sont titulaires ; on crée l'enseignant sans classe puis on l'affecte via
  // Titulaire.

  // Matière de DIFFICULTÉ (le cours qu'il NE donne PAS) — optionnel
  @ManyToOne(() => Cours, { eager: true, nullable: true })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}