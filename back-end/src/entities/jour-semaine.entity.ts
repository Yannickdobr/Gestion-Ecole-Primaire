import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité JourSemaine – Jours de la semaine paramétrables
 * Correspond à la table `joursemaine` du MCD
 */
@Entity('joursemaine')
export class JourSemaine {

  @Column({ type: 'smallint', default: 0, name: 'isDelete' })
  isDelete: number;
  @PrimaryGeneratedColumn({ type: 'int' })
  ID: number;

  @Column({ type: 'varchar', length: 15 })
  libelle: string; // ex: "Lundi", "Mardi"...
}
