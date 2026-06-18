import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfesseursController } from './professeurs.controller';
import { ProfesseursService } from './professeurs.service';
import { Enseignant } from '../entities/enseignant.entity';
import { Titulaire } from '../entities/titulaire.entity';
import { Personne } from '../entities/personne.entity';
import { Admin } from '../entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enseignant, Titulaire, Personne, Admin]),
  ],
  controllers: [ProfesseursController],
  providers: [ProfesseursService],
  exports: [ProfesseursService],
})
export class ProfesseursModule {}