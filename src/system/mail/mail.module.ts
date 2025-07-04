import { Module } from '@nestjs/common';
import { MAIL_SERVICE_TOKEN } from './mail.interface';
import { LocalMailServiceImpl, MailServiceImpl } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    LocalMailServiceImpl,
    MailServiceImpl,
    {
      provide: MAIL_SERVICE_TOKEN,
      useFactory: (
        local: LocalMailServiceImpl,
        prod: MailServiceImpl,
        config: ConfigService,
      ) => {
        return config.get('NODE_ENV') === 'production' ? prod : local;
      },
      inject: [LocalMailServiceImpl, MailServiceImpl, ConfigService],
    },
  ],
  exports: [MAIL_SERVICE_TOKEN],
})
export class MailModule {}
