import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Payment } from '../domain/data-access/entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
  constructor(
    @InjectRepository(Payment)
    repository: Repository<Payment>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findUserPaymentsByUserId(userId: string) {
    return this.find({
      where: {
        userId,
      },
    });
  }
}
