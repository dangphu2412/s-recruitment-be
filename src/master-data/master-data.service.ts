import { Injectable } from '@nestjs/common';
import { MasterDataCommonRepository } from './master-data-common-repository.service';
import { CreateCommonDto } from './dtos/create-common.dto';

@Injectable()
export class MasterDataService {
  constructor(
    private readonly masterDataRepository: MasterDataCommonRepository,
  ) {}

  findByCode(code: string) {
    return this.masterDataRepository.findBy({
      code: code,
    });
  }

  createByCode(code: string, body: CreateCommonDto) {
    return this.masterDataRepository.insert({
      code: code,
      ...body,
    });
  }
}
