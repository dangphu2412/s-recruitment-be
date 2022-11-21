import { ForbiddenException } from '@nestjs/common';
import { createAuthorizationClientCode } from './create-authorization-client.factory';

export class NotMemberForbiddenException extends ForbiddenException {
  constructor() {
    super(createAuthorizationClientCode('NOT_MEMBER'));
  }
}
