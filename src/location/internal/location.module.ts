import { Module } from '@nestjs/common';
import { LocationServiceToken } from '../client';
import { LocationServiceImpl } from './location.service';
import { LocationController } from './location.controller';

@Module({
  controllers: [LocationController],
  providers: [{ provide: LocationServiceToken, useClass: LocationServiceImpl }],
})
export class LocationModule {}
