import { Logger, Module } from '@nestjs/common';
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
        const isProd = config.get('NODE_ENV') === 'production';
        Logger.log(
          `MailService use ${isProd ? 'Resend' : 'Local MailDev'}`,
          MailModule.name,
        );
        return isProd ? prod : local;
      },
      inject: [LocalMailServiceImpl, MailServiceImpl, ConfigService],
    },
  ],
  exports: [MAIL_SERVICE_TOKEN],
})
export class MailModule {}
