import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElevesController } from './eleves.controller';
import { ElevesService } from './eleves.service';
import { Eleve } from '../entities/eleve.entity';
import { Parents } from '../entities/parents.entity';
import { VilleNaissance } from '../entities/ville-naissance.entity';
import { Admin } from '../entities/admin.entity';
import { Personne } from '../entities/personne.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Eleve, Parents, VilleNaissance, Admin, Personne]),
  ],
  controllers: [ElevesController],
  providers: [ElevesService],
  exports: [ElevesService],
})
export class ElevesModule {}