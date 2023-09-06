import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ModuleConfig, BcryptService } from './services';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  providers: [BcryptService, ModuleConfig, ConfigService],
  exports: [BcryptService, ModuleConfig],
})
export class SharedModule {}
