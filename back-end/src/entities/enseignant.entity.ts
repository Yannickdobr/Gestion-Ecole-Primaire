import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Admin } from './admin.entity';
import { Cours } from './cours.entity';

@Entity('Enseignant')
export class Enseignant {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idEnseignant: number;

  // ✅ FIX: SQL a "Actif" avec A majuscule — on spécifie le nom de colonne explicitement
  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1, name: 'Actif' })
  actif: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Personne, { eager: true, nullable: false })
  @JoinColumn({ name: 'idPers' })
  personne: Personne;

  @ManyToOne(() => Cours, { eager: true, nullable: false })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}