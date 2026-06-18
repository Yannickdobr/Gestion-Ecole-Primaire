import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagerieController } from './messagerie.controller';
import { MessagerieService } from './messagerie.service';
import { Messages } from '../entities/messages.entity';
import { Personne } from '../entities/personne.entity';
import { Parents } from '../entities/parents.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Messages, Personne, Parents]),
  ],
  controllers: [MessagerieController],
  providers: [MessagerieService],
  exports: [MessagerieService],
})
export class MessagerieModule {}