import { Controller, Get, Param } from '@nestjs/common';
import { MasterDataService } from './master-data.service';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.masterDataService.findByCode(code);
  }
}
