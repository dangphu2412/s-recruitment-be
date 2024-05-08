import { UnprocessableEntityException } from '@nestjs/common';
import { createUserClientCode } from './create-user-client.code';

export class InsertUserFailedException extends UnprocessableEntityException {
  constructor() {
    super(createUserClientCode('INSERT_FAILED'));
  }
}
