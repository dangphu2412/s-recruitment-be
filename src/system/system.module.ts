import { Global, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MessageQueueModule } from './message-queue/message-queue.module';
import { LoggerModule } from 'nestjs-pino';

@Global()
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MailModule,
    ScheduleModule.forRoot(),
    MessageQueueModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd =
          configService.get<string | undefined>('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            autoLogging: false,
            level: isProd ? 'info' : 'debug',
            // In Local env, we use pino-pretty to format logs for human readability, not machine readability.
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                  },
                },
          },
          exclude: [{ method: RequestMethod.ALL, path: 'health' }],
        };
      },
    }),
  ],
})
export class SystemModule {}
