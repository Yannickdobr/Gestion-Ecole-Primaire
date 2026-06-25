import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

// Global : MailService injectable partout sans réimporter le module
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
