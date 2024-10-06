import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { MasterDataCommon } from './entities/master-data.entity';

@Injectable()
export class MasterDataCommonRepository extends Repository<MasterDataCommon> {
  constructor(
    @InjectRepository(MasterDataCommon)
    repository: Repository<MasterDataCommon>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
