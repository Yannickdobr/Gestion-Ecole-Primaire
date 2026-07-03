import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministrationService } from './administration.service';
import {
  JustificatifsController, FicheEnseignantController, ResidenceController,
} from './administration.controllers';
import { Justificatifs } from '../entities/justificatifs.entity';
import { FicheEnseignant } from '../entities/fiche-enseignant.entity';
import { Quartier } from '../entities/quartier.entity';
import { Residents } from '../entities/residents.entity';
import { Enseignant } from '../entities/enseignant.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Justificatifs, FicheEnseignant, Quartier, Residents,
      Enseignant, AnneeAcademique, Personne, Admin,
    ]),
  ],
  controllers: [JustificatifsController, FicheEnseignantController, ResidenceController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
