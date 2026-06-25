import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Livres } from './livres.entity';

/**
 * Entité Specialite
 * ✅ FIX: suppression de idParent — absent de la BD SQL
 * BD: idSpecialite, libelle, idAdmin uniquement
 */
@Entity('specialite')
export class Specialite {
  @PrimaryGeneratedColumn({ type: 'int' })
  idSpecialite: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Livres, (livre) => livre.specialite)
  livres: Livres[];
}