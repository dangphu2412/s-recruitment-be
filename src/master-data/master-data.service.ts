import { Injectable } from '@nestjs/common';
import { MasterDataCommonRepository } from './master-data-common-repository.service';
import { CreateCommonDto } from './dtos/create-common.dto';
import { CommonCodes } from './constants/common-data-code.constant';

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
    if (!CommonCodes[code]) {
      throw new Error('Invalid code');
    }

    return this.masterDataRepository.insert({
      code: code,
      ...body,
    });
  }
}
