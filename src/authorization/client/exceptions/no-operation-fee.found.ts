import { NotFoundException } from '@nestjs/common';
import { createAuthorizationClientCode } from './create-authorization-client.factory';

export class NoOperationFeeFound extends NotFoundException {
  constructor() {
    super(createAuthorizationClientCode('NOT_FOUND'));
  }
}
