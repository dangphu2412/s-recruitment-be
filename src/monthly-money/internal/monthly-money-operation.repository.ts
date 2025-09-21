import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { OperationFee } from '../../system/database/entities/operation-fee.entity';

@Injectable()
export class MonthlyMoneyOperationRepository extends Repository<OperationFee> {
  constructor(
    @InjectRepository(OperationFee)
    repository: Repository<OperationFee>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
