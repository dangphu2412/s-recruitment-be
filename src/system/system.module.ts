import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { EnvironmentKeyFactory } from './services';
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
  providers: [EnvironmentKeyFactory],
  exports: [EnvironmentKeyFactory],
})
export class SystemModule {}
