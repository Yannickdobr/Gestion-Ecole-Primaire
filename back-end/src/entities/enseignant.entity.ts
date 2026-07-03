import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Admin } from './admin.entity';
import { Cours } from './cours.entity';
import { Classe } from './classe.entity';

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

  // Classe gérée par l'enseignant (il y donne toutes les matières sauf la
  // matière de difficulté ci-dessous). L'affichage « Classe X · Salle Y »
  // dérive la salle via classe.salles côté requêtes.
  @ManyToOne(() => Classe, { eager: true, nullable: true })
  @JoinColumn({ name: 'idClasse' })
  classe: Classe;

  // Matière de DIFFICULTÉ (le cours qu'il NE donne PAS) — optionnel
  @ManyToOne(() => Cours, { eager: true, nullable: true })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}