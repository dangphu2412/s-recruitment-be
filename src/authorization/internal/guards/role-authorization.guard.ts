import { Injectable } from '@nestjs/common';
import { CreateAuthorizationGuard } from '../guard-factory';
import { RoleAuthorizationStrategy } from '../strategies/role-authorization.strategy';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleAuthorizationGuard extends CreateAuthorizationGuard(
  RoleAuthorizationStrategy.name,
) {
  constructor(private reflector: Reflector) {
    super(reflector);
  }
}
