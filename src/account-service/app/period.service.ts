import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Period } from '../domain/data-access/entities/period.entity';
import { PeriodService } from '../domain/core/services/period.service';

@Injectable()
export class PeriodServiceImpl implements PeriodService {
  constructor(
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
  ) {}

  async findPeriods(): Promise<Period[]> {
    return this.periodRepository.find();
  }
}
