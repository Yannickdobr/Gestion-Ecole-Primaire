import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Eleve } from './eleve.entity';

/**
 * Entité VilleNaissance – Référentiel des villes de naissance
 * Correspond à la table `villenaissance` du MCD
 */
@Entity('villenaissance')
export class VilleNaissance {
  @PrimaryGeneratedColumn({ type: 'int' })
  idVille: number;

  @Column({ type: 'varchar', length: 100, default: 'Autres' })
  libelle: string;

  @Column({ type: 'smallint', default: 1 })
  actif: number;

  // ─── Relations ────────────────────────────────────────────────────────
  @OneToMany(() => Eleve, (eleve) => eleve.villeNaissance)
  eleves: Eleve[];
}