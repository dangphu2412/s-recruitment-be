import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { CreateCommonDto } from './dtos/create-common.dto';
import { CanAccessBy } from '../account-service/adapters/decorators/can-access-by.decorator';
import { AccessRights } from '../account-service/domain/constants/role-def.enum';

@Controller('master-data')
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.masterDataService.findByCode(code);
  }

  @CanAccessBy(AccessRights.MANAGE_MASTER_DATA)
  @Post(':code')
  createByCode(@Param('code') code: string, @Body() body: CreateCommonDto) {
    return this.masterDataService.createByCode(code, body);
  }
}
