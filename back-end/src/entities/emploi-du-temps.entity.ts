import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Classe } from './classe.entity';
import { Cours } from './cours.entity';

/**
 * Entité EmploiDuTemps
 * ✅ FIX: suppression de heureFin, idJour, idEnseignant absents de la BD SQL
 * La BD ne contient que : idTemps, jour, heure, idClasse, idCours, idAdmin, created_at
 */
@Entity('emploidutemps')
export class EmploiDuTemps {
  @PrimaryGeneratedColumn({ type: 'int' })
  idTemps: number;

  @Column({ type: 'varchar', length: 30 })
  jour: string; // ex: "Lundi"

  @Column({ type: 'varchar', length: 6 })
  heure: string; // ex: "08:00"

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Classe, { eager: true, nullable: false })
  @JoinColumn({ name: 'idClasse' })
  classe: Classe;

  @ManyToOne(() => Cours, { eager: true, nullable: false })
  @JoinColumn({ name: 'idCours' })
  cours: Cours;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}