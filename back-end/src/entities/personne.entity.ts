import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Admin } from './admin.entity';

/**
 * Entité Personne – Entité centrale partagée par tous les acteurs
 * Correspond à la table `personne` du MCD
 * ✅ CORRECTION WARN : @Exclude() sur password pour ne jamais l'exposer en API
 *
 * typePersonne :
 *   1 = Administrateur
 *   2 = Professeur / Enseignant
 *   3 = Élève
 *   4 = Parent / Tuteur
 */
@Entity('personne')
export class Personne {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idPers: number;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  prenom: string;

  @Column({ type: 'date' })
  dateNaissance: Date;

  @Column({ type: 'varchar', length: 100, default: 'INDEFINI' })
  lieuNaissance: string;

  @Column({ type: 'varchar', length: 15, default: '000' })
  mobile: string;

  @Column({ type: 'varchar', length: 15, default: '000' })
  phone: string;

  @Column({ type: 'smallint', comment: '1= Enseignant , 2 = Administratif, 3 = Scolarite, 4= parents, 5 = Autres' })
  typePersonne: number; // 1= Enseignant , 2 = Administratif, 3 = Scolarite, 4= parents, 5 = Autres

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  // ✅ CORRECTION WARN : password jamais retourné dans les réponses API
  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  alanyaID: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

 // ─── Relations ────────────────────────────────────────────────────────
  @ManyToOne(() => Admin, (admin) => admin.personnes, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;
}
