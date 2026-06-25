import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VilleNaissance } from '../entities/ville-naissance.entity';
import { VillesService } from './villes.service';
import { VillesController } from './villes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VilleNaissance])],
  controllers: [VillesController],
  providers: [VillesService],
})
export class VillesModule {}
