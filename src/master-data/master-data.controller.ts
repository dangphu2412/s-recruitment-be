import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { CreateCommonDto } from './dtos/create-common.dto';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.masterDataService.findByCode(code);
  }

  @Post(':code')
  createByCode(@Param('code') code: string, @Body() body: CreateCommonDto) {
    return this.masterDataService.createByCode(code, body);
  }
}
