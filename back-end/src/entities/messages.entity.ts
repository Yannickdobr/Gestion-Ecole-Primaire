import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Personne } from './personne.entity';
import { Parents } from './parents.entity';

/**
 * Entité Messages
 * ✅ FIX: AnneeAcade est VARCHAR(15) dans la BD (pas de FK vers AnneeAcademique)
 * type_message: 0=individuel, 1=tous parents, 2=tous parents paiement
 */
@Entity('Messages')
export class Messages {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  idMessages: number;

  @Column({ type: 'varchar', length: 255 })
  objet: string;

  @Column({ type: 'text' })
  information: string;

  @Column({ type: 'smallint', unsigned: true, default: 0, comment: '0 = individuel, 1= tous les parents , 2 = tous les parents pour paiement' })
  type_message: number;

  // ✅ FIX: VARCHAR(15) comme dans la BD — pas de FK
  @Column({ type: 'varchar', length: 15 })
  AnneeAcade: string; // ex: "2024-2025"

  @Column({ type: 'tinyint', unsigned: true, width: 1, default: 0 })
  valider: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => Personne, { eager: true, nullable: false })
  @JoinColumn({ name: 'idExp_Pers' })
  expediteur: Personne;

  @ManyToOne(() => Parents, { eager: true, nullable: false })
  @JoinColumn({ name: 'idParent' })
  destinataire: Parents;
}