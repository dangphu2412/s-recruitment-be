import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { Period } from './period.entity';
import { IsString } from 'class-validator';
import {
  CanAccessBy,
  Identified,
} from '../../account-service/account-service.package';
import { Permissions } from '../../account-service/authorization/access-definition.constant';

export const PeriodCRUDService = createCRUDService(Period);

class CreatePeriodDTO {
  @IsString()
  name: string;
  @IsString()
  description: string;
}

@Controller('periods')
export class PeriodController {
  constructor(
    @Inject(PeriodCRUDService.token)
    private readonly periodService: ResourceCRUDService<Period>,
  ) {}

  @Identified
  @Get()
  async find() {
    return this.periodService.find();
  }

  @CanAccessBy(Permissions.WRITE_PERIODS)
  @Post()
  async createOne(@Body() dto: CreatePeriodDTO) {
    return this.periodService.createOne(dto);
  }
}
