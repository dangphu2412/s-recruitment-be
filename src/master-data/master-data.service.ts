import { Injectable } from '@nestjs/common';
import { MasterDataCommonRepository } from './master-data-common-repository.service';

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
}
