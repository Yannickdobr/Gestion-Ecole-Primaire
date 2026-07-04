import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parents } from '../entities/parents.entity';
import { Messages } from '../entities/messages.entity';
import { Personne } from '../entities/personne.entity';
import { AccessControlService } from './access-control.service';
import { NotificationService } from './notification.service';

/**
 * Module global (commun) : rend AccessControlService (confidentialité parent)
 * et NotificationService (notifications automatiques) disponibles partout
 * sans réimport. MailService est déjà global.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Parents, Messages, Personne])],
  providers: [AccessControlService, NotificationService],
  exports: [AccessControlService, NotificationService],
})
export class AccessControlModule {}
