import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationServiceToken } from '../client';
import { LocationServiceImpl } from './location.service';
import { LocationController } from './location.controller';
import { ProvinceRepository } from './province.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProvinceRepository])],
  controllers: [LocationController],
  providers: [{ provide: LocationServiceToken, useClass: LocationServiceImpl }],
})
export class LocationModule {}
