import { Module } from '@nestjs/common';
import { MAIL_SERVICE_TOKEN } from './mail.interface';
import { MailServiceImpl } from './mail.service';

@Module({
  providers: [
    {
      provide: MAIL_SERVICE_TOKEN,
      useClass: MailServiceImpl,
    },
  ],
  exports: [MAIL_SERVICE_TOKEN],
})
export class MailModule {}
