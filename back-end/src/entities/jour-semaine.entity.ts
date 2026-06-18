import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entité JourSemaine – Jours de la semaine paramétrables
 * Correspond à la table `joursemaine` du MCD
 */
@Entity('joursemaine')
export class JourSemaine {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  ID: number;

  @Column({ type: 'varchar', length: 15 })
  libelle: string; // ex: "Lundi", "Mardi"...
}
