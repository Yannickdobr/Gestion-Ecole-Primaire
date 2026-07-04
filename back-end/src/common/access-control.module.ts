import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parents } from '../entities/parents.entity';
import { AccessControlService } from './access-control.service';

/**
 * Module global : rend AccessControlService disponible partout
 * (élèves, paiements, évaluations…) sans réimport.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Parents])],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlModule {}
