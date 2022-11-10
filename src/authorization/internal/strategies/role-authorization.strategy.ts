import { Inject, Injectable } from '@nestjs/common';
import {
  RoleStorage,
  RoleStorageToken,
  AuthorizationStrategy,
} from '../../client';
import { JwtPayload } from '../../../authentication';
import { useAuthorizationStrategy } from './authorization-strategy.register';
import { LogoutRequiredException } from '../../../authentication/client/exceptions/logout-required.exception';

@Injectable()
export class RoleAuthorizationStrategy
  implements AuthorizationStrategy<JwtPayload, string[]>
{
  constructor(
    @Inject(RoleStorageToken)
    private readonly roleStorage: RoleStorage,
  ) {
    useAuthorizationStrategy(RoleAuthorizationStrategy.name, this);
  }

  async canAccess(
    { sub }: JwtPayload,
    requiredRoles: string[],
  ): Promise<boolean> {
    const userRoles = await this.roleStorage.get(sub);

    if (!userRoles) {
      throw new LogoutRequiredException();
    }

    return requiredRoles.some((role) => userRoles[role]);
  }
}
