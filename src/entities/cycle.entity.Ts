import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Classe } from './classe.entity';

@Entity('Cycle')  // ✅ nom exact de la table SQL (casse)
export class Cycle {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idCycle: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'tinytext' })
  description: string;

  // ✅ FIX: SQL utilise "created" (pas created_at)
  @Column({ type: 'datetime', name: 'created', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created: Date;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Classe, (classe) => classe.cycle)
  classes: Classe[];
}