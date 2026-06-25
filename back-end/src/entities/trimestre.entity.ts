import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { AnneeAcademique } from './annee-academique.entity';
import { Session } from './session.entity';

/**
 * Entité Trimestre – Trimestre appartenant à une année académique
 * Correspond à la table `trimestre` du MCD
 */
@Entity('trimestre')
export class Trimestre {
  @PrimaryGeneratedColumn({ type: 'int' })
  idTrimes: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'varchar', length: 255 })
  periode: string;

  // ─── Relations ────────────────────────────────────────────────────────

  @ManyToOne(() => AnneeAcademique, { eager: true, nullable: false })
  @JoinColumn({ name: 'idAca' })
  anneeAcademique: AnneeAcademique;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Session, (session) => session.trimestre)
  sessions: Session[];
}
