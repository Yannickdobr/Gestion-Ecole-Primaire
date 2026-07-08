import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { VilleNaissance } from './ville-naissance.entity';
import { Parents } from './parents.entity';
import { Frequente } from './frequente.entity';

/**
 * Entité Eleve – Apprenant inscrit dans l'établissement
 * Correspond à la table `eleve` du MCD
 *
 * sexe : 1 = Masculin, 2 = Féminin
 * actif : 1 = actif, 0 = inactif
 */
@Entity('eleve')
export class Eleve {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  matricule: number;

  @Column({ type: 'varchar', length: 60 })
  nom: string;

  @Column({ type: 'varchar', length: 60 })
  prenom: string;

  @Column({ type: 'date' })
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 30 })
  lieuNaissance: string;

  @Column({ type: 'smallint', default: 0, comment: '0 = fille, 1 = garcon, 2 = autres' })
  sexe: number; // 0=fille, 1=garcon, 2=autres

  @Column({ type: 'varchar', length: 30, default: 'INDEFINI' })
  langue: string;

  @Column({ type: 'varchar', length: 255, default: 'INDEFINI' })
  photoURL: string;

  // Groupe sanguin (A+, O-, AB+…). Nullable : pas toujours renseigné.
  @Column({ type: 'varchar', length: 5, nullable: true })
  groupeSanguin: string | null;

  @Column({ type: 'smallint', default: 0 })
  actif: number; // 1=actif, 0=inactif

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => VilleNaissance, (ville) => ville.eleves, { nullable: false, eager: true })
  @JoinColumn({ name: 'idVilleNaissance' })
  villeNaissance: VilleNaissance;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Parents, (parent) => parent.eleve)
  parents: Parents[];

  // ✅ CORRECTION ERREUR 1 : back-référence dédiée vers Frequente
  @OneToMany(() => Frequente, (frequente) => frequente.eleve)
  frequentations: Frequente[];
}
