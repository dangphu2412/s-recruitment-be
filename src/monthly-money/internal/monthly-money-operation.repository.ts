import { Repository } from 'typeorm';
import { OperationFee } from '../client';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonthlyMoneyOperationRepository extends Repository<OperationFee> {
  constructor(
    @InjectRepository(OperationFee)
    repository: Repository<OperationFee>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
}
