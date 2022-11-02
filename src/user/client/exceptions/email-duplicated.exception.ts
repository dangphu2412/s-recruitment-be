import { UnprocessableEntityException } from '@nestjs/common';
import { createUserClientCode } from './create-user-client.code';

export class EmailDuplicatedException extends UnprocessableEntityException {
  constructor() {
    super(createUserClientCode('EMAIL_DUPLICATED'));
  }
}
