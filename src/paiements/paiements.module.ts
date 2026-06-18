import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaiementsController } from './paiements.controller';
import { PaiementsService } from './paiements.service';
import { Mode } from '../entities/mode.entity';
import { Scolarite } from '../entities/scolarite.entity';
import { Tranches } from '../entities/tranches.entity';
import { Paiement } from '../entities/paiement.entity';
import { Eleve } from '../entities/eleve.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Cycle } from '../entities/cycle.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mode, Scolarite, Tranches, Paiement,
      Eleve, AnneeAcademique, Cycle, Personne, Admin,
    ]),
  ],
  controllers: [PaiementsController],
  providers: [PaiementsService],
  exports: [PaiementsService],
})
export class PaiementsModule {}
