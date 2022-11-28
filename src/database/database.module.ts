import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleConfig } from '@shared/services/module-config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ModuleConfig],
      useFactory: (moduleConfigService: ModuleConfig) =>
        moduleConfigService.getTypeormConfig(),
    }),
    TypeOrmModule.forRootAsync({
      name: 'SEEDING_CONFIG',
      inject: [ModuleConfig],
      useFactory: (moduleConfigService: ModuleConfig) =>
        moduleConfigService.getSeederConfig(),
    }),
  ],
})
export class DatabaseModule {}
