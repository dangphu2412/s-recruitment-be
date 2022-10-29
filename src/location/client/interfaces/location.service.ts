import { createInterfaceToken } from '../../../utils';
import { Province } from '../entities/province.entity';
import { LocationQuery } from '../types/location-query.types';

export const LocationServiceToken = createInterfaceToken('LocationService');

export interface LocationService {
  find(query: LocationQuery): Promise<Province[]>;
}
