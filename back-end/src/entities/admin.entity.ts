import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Personne } from './personne.entity';
  
  /**
   * Entité Admin – Compte administrateur de l'application
   * Correspond à la table `admin` du MCD
   *
   * typeAdmin :
   *   1 = Super Administrateur
   *   2 = Administrateur standard
   *   3 = Fondateur / Directeur
   */
  @Entity('admin')
  export class Admin {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    ID: number;
  
    @Column({ type: 'varchar', length: 100, default: 'Root' })
    nom: string;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;
  
    @Column({ type: 'varchar', length: 255 })
    password: string; // stocké en bcrypt
  
    @Column({ type: 'tinyint', unsigned: true, width: 1, default: 1 })
    actif: number; // 1 = actif, 0 = désactivé
  
    @Column({ type: 'smallint', unsigned: true, comment: '0 = root, 1 = Admin, 2 = Fondateur , 3 = Directeur' })
    typeAdmin: number; // 0=root, 1=Admin, 2=Fondateur, 3=Directeur
  
    @Column({ type: 'varchar', length: 15 })
    mobile: string;
  
    @Column({ type: 'varchar', length: 15 })
    alanyaID: string;
  
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
    // Un admin peut gérer plusieurs Personnes
    @OneToMany(() => Personne, (personne) => personne.admin)
    personnes: Personne[];
  }