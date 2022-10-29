import { Injectable } from '@nestjs/common';
import {
  LocationService,
  Province,
  ProvinceType,
  LocationQuery,
} from '../client';
import { ProvinceRepository } from './province.repository';

@Injectable()
export class LocationServiceImpl implements LocationService {
  constructor(private readonly provinceRepository: ProvinceRepository) {}

  async find(query: LocationQuery): Promise<Province[]> {
    switch (query.type) {
      case ProvinceType.CITY:
        return this.provinceRepository.findRoots();
      case ProvinceType.DISTRICT:
        const city = await this.provinceRepository.findOne(query.cityId);

        if (!city) {
          return [];
        }

        return this.provinceRepository.findDescendants(city);
      default:
        throw new Error(`Un support query type of location ${query.type}`);
    }
  }
}
