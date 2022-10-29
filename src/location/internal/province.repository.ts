import { EntityRepository, TreeRepository } from 'typeorm';
import { Province } from '../client';

@EntityRepository(Province)
export class ProvinceRepository extends TreeRepository<Province> {}
