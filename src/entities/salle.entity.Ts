import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Classe } from './classe.entity';
import { Frequente } from './frequente.entity';

/**
 * Entité Salle
 * ✅ FIX: ajout du champ "actif" présent dans la BD mais manquant dans l'entity
 */
@Entity('Salle')
export class Salle {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idSalle: number;

  @Column({ type: 'varchar', length: 30 })
  libelle: string;

  @Column({ type: 'varchar', length: 100, default: 'INDEFINI' })
  position: string;

  @Column({ type: 'varchar', length: 30 })
  surface: string;

  // ✅ FIX: champ actif présent dans la BD (tinyint DEFAULT 1)
  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1 })
  actif: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Classe, (classe) => classe.salles, { eager: true, nullable: false })
  @JoinColumn({ name: 'idClasse' })
  classe: Classe;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Frequente, (frequente) => frequente.salle)
  frequentations: Frequente[];
}