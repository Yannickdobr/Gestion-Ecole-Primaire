import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { Trimestre } from '../entities/trimestre.entity';
import { Session } from '../entities/session.entity';
import { NatureEpreuve } from '../entities/nature-epreuve.entity';
import { Epreuve } from '../entities/epreuve.entity';
import { Evaluation } from '../entities/evaluation.entity';
import { Rapport } from '../entities/rapport.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Eleve } from '../entities/eleve.entity';
import { Cours } from '../entities/cours.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trimestre, Session, NatureEpreuve, Epreuve,
      Evaluation, Rapport, AnneeAcademique,
      Eleve, Cours, Personne, Admin,
    ]),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
