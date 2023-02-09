import { BadRequestException } from '@nestjs/common';
import { createAuthorizationClientCode } from '@authorization/client/exceptions/create-authorization-client.factory';

export class InvalidRoleUpdateException extends BadRequestException {
  constructor() {
    super(createAuthorizationClientCode('INVALID_ROLE_UPDATE'));
  }
}
