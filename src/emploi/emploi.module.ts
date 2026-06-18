import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmploiController } from './emploi.controller';
import { EmploiService } from './emploi.service';
import { EmploiDuTemps } from '../entities/emploi-du-temps.entity';
import { JourSemaine } from '../entities/jour-semaine.entity';
import { Classe } from '../entities/classe.entity';
import { Cours } from '../entities/cours.entity';
import { Admin } from '../entities/admin.entity';
import { Enseignant } from '../entities/enseignant.entity';

@Module({
  imports: [
    // ✅ CORRECTION WARN : Enseignant ajouté pour la relation dans EmploiDuTemps
    TypeOrmModule.forFeature([
      EmploiDuTemps, JourSemaine, Classe, Cours, Admin, Enseignant,
    ]),
  ],
  controllers: [EmploiController],
  providers: [EmploiService],
  exports: [EmploiService],
})
export class EmploiModule {}
