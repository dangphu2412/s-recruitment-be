import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleConfig } from 'src/system/services/module-config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ModuleConfig],
      useFactory: (moduleConfigService: ModuleConfig) =>
        moduleConfigService.getPostgresConfig(),
    }),
  ],
})
export class DatabaseModule {}
