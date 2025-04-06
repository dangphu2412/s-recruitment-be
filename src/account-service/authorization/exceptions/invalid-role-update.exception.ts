import { UnprocessableEntityException } from '@nestjs/common';
import { createAuthorizationClientCode } from './create-authorization-client.factory';

export class InvalidRoleUpdateException extends UnprocessableEntityException {
  constructor() {
    super(createAuthorizationClientCode('ABORT_ROLE_UPDATE'));
  }
}
