import { ProvinceType } from '../constants';

export type LocationQuery = {
  type: ProvinceType;
  cityId?: number;
};
