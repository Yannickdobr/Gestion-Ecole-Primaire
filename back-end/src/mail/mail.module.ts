import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { WhatsappService } from './whatsapp.service';

// Global : MailService + WhatsappService injectables partout sans réimporter le module
@Global()
@Module({
  providers: [MailService, WhatsappService],
  exports: [MailService, WhatsappService],
})
export class MailModule {}
