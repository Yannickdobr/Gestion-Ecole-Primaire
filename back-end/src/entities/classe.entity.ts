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
  import { Cycle } from './cycle.entity';
  import { Salle } from './salle.entity';
  
  /**
   * Entité Classe – Division scolaire rattachée à un niveau et un cycle
   * Correspond à la table `classe` du MCD
   */
  @Entity('classe')
  export class Classe {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
    @PrimaryGeneratedColumn({ type: 'int' })
    idClasse: number;
  
    @Column({ type: 'varchar', length: 100, default: 'INDEFINI' })
    libelle: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
  
    @ManyToOne(() => Cycle, (cycle) => cycle.classes, { eager: true, nullable: false })
    @JoinColumn({ name: 'idCycle' })
    cycle: Cycle;
  
    @ManyToOne(() => Admin, { nullable: false })
    @JoinColumn({ name: 'idAdmin' })
    admin: Admin;
  
    @OneToMany(() => Salle, (salle) => salle.classe)
    salles: Salle[];
  }