import { Controller, Get, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { LocationService, LocationServiceToken, ProvinceType } from '../client';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  version: '1',
  path: 'locations',
})
@ApiTags('locations')
export class LocationController {
  constructor(
    @Inject(LocationServiceToken)
    private readonly locationService: LocationService,
  ) {}

  @Get('/cities')
  findCity() {
    return this.locationService.find({
      type: ProvinceType.CITY,
    });
  }

  @Get('/cities/:cityId/districts')
  findDistricts(@Param('cityId', ParseIntPipe) cityId: number) {
    return this.locationService.find({
      type: ProvinceType.DISTRICT,
      cityId: cityId,
    });
  }
}
