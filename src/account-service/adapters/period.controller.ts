import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { Period } from '../domain/data-access/entities/period.entity';
import { IsString } from 'class-validator';

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

  @Get()
  async find() {
    return this.periodService.find();
  }

  @Post()
  async createOne(@Body() dto: CreatePeriodDTO) {
    return this.periodService.createOne(dto);
  }
}
