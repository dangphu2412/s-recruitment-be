import { MonthlyMoneyOperationService, OperationFee } from '../client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    @InjectRepository(OperationFee)
    private readonly operationFeeRepository: Repository<OperationFee>,
  ) {}
}
