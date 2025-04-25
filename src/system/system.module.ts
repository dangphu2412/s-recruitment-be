import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpQueryModule } from './query-shape/http-query.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';

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
    HttpQueryModule.register({
      defaultSize: 25,
    }),
    EventEmitterModule.forRoot(),
  ],
})
export class SystemModule {}
