import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Exclude } from 'class-transformer';
  import { Personne } from './personne.entity';

  /**
   * Entité Admin – Compte administrateur de l'application
   * Correspond à la table `admin` du MCD
   *
   * typeAdmin :
   *   0 = Root (super-administrateur)
   *   1 = Admin
   *   2 = Fondateur
   *   3 = Directeur
   */
  @Entity('admin')
  export class Admin {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
    @PrimaryGeneratedColumn({ type: 'int' })
    ID: number;
  
    @Column({ type: 'varchar', length: 100, default: 'Root' })
    nom: string;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    username: string;
  
    @Exclude()
    @Column({ type: 'varchar', length: 255 })
    password: string; // stocké en bcrypt, jamais exposé en API
  
    @Column({ type: 'smallint', default: 1 })
    actif: number; // 1 = actif, 0 = désactivé
  
    @Column({ type: 'smallint', comment: '0 = root, 1 = Admin, 2 = Fondateur , 3 = Directeur' })
    typeAdmin: number; // 0=root, 1=Admin, 2=Fondateur, 3=Directeur
  
    @Column({ type: 'varchar', length: 15 })
    mobile: string;
  
    @Column({ type: 'varchar', length: 15 })
    alanyaID: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
  
    // ─── Relations ────────────────────────────────────────────────────────
    // Un admin peut gérer plusieurs Personnes
    @OneToMany(() => Personne, (personne) => personne.admin)
    personnes: Personne[];
  }