import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';

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
  ],
})
export class SystemModule {}
