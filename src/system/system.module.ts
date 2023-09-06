import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { DigestService, EnvironmentKeyFactory } from './services';
import { HttpQueryModule } from './query-shape/http-query.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    HttpQueryModule.register(),
  ],
  providers: [DigestService, EnvironmentKeyFactory],
  exports: [DigestService, EnvironmentKeyFactory],
})
export class SystemModule {}
