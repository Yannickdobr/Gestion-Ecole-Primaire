import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursController } from './cours.controller';
import { CoursService } from './cours.service';
import { Cours } from '../entities/cours.entity';
import { Discipline } from '../entities/discipline.entity';
import { Specialite } from '../entities/specialite.entity';
import { Livres } from '../entities/livres.entity';
import { Classe } from '../entities/classe.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cours, Discipline, Specialite, Livres, Classe, Admin,
    ]),
  ],
  controllers: [CoursController],
  providers: [CoursService],
  exports: [CoursService],
})
export class CoursModule {}