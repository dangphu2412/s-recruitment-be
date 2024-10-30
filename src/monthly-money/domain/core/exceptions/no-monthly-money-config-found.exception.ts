import { NotFoundException } from '@nestjs/common';
import { createMonthlyMoneyClientCode } from './create-user-client.factory';

export class NoMonthlyMoneyConfigFoundException extends NotFoundException {
  constructor() {
    super(createMonthlyMoneyClientCode('NOT_FOUND'));
  }
}
