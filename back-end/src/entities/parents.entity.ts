import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
  } from 'typeorm';
  import { Personne } from './personne.entity';
  import { Eleve } from './eleve.entity';
  import { Admin } from './admin.entity';
  
  /**
   * Entité Parents – Lie un parent (Personne) à un élève
   * Correspond à la table `parents` du MCD
   * Permet la gestion multi-tuteurs (un élève peut avoir plusieurs tuteurs)
   */
  @Entity('parents')
  @Unique('uniqueParent', ['personne', 'eleve'])
  export class Parents {
    @PrimaryGeneratedColumn({ type: 'int' })
    idParent: number;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
  
    @ManyToOne(() => Personne, { eager: true, nullable: false })
    @JoinColumn({ name: 'idPers' })
    personne: Personne;
  
    @ManyToOne(() => Eleve, (eleve) => eleve.parents, { nullable: false })
    @JoinColumn({ name: 'matricule' })
    eleve: Eleve;
  
    @ManyToOne(() => Admin, { nullable: false })
    @JoinColumn({ name: 'idAdmin' })
    admin: Admin;
  }