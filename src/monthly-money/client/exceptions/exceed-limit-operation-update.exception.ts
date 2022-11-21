import { UnprocessableEntityException } from '@nestjs/common';
import { createMonthlyMoneyClientCode } from './create-user-client.factory';

export class ExceedLimitOperationUpdateException extends UnprocessableEntityException {
  constructor(message: string) {
    super(createMonthlyMoneyClientCode('EXCEED_LIMIT'));

    this.message = message;
  }
}
