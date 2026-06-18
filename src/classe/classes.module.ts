import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Cycle } from '../entities/cycle.entity';
import { Classe } from '../entities/classe.entity';
import { Salle } from '../entities/salle.entity';
import { AnneeAcademique } from '../entities/annee-academique.entity';
import { Frequente } from '../entities/frequente.entity';
import { Admin } from '../entities/admin.entity';
import { Eleve } from '../entities/eleve.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cycle, Classe, Salle, AnneeAcademique, Frequente, Admin, Eleve,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}