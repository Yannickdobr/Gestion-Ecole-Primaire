import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Classe } from './classe.entity';

@Entity('cycle')  // ✅ nom exact de la table SQL (casse)
export class Cycle {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  idCycle: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'text' })
  description: string;

  // ✅ FIX: SQL utilise "created" (pas created_at)
  @Column({ type: 'timestamp', name: 'created', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;

  @ManyToOne(() => Admin, { nullable: false })
  @JoinColumn({ name: 'idAdmin' })
  admin: Admin;

  @OneToMany(() => Classe, (classe) => classe.cycle)
  classes: Classe[];
}