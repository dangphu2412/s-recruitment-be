import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentKeyFactory } from 'src/system/services/environment-key.factory';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvironmentKeyFactory],
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getPostgresConfig(),
    }),
  ],
})
export class DatabaseModule {}
