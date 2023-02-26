import { Inject, Injectable } from '@nestjs/common';
import {
  AccessRightStorage,
  AccessRightStorageToken,
  AuthorizationStrategy,
} from '../../client';
import { JwtPayload } from '@authentication/client';
import { LogoutRequiredException } from '@authentication/client/exceptions/logout-required.exception';
import { registerStrategy } from './authorization-strategy.register';

@Injectable()
export class RoleAuthorizationStrategy
  implements AuthorizationStrategy<JwtPayload, string[]>
{
  constructor(
    @Inject(AccessRightStorageToken)
    private readonly roleStorage: AccessRightStorage,
  ) {
    registerStrategy(RoleAuthorizationStrategy.name, this);
  }

  async canAccess(
    { sub }: JwtPayload,
    requiredRights: string[],
  ): Promise<boolean> {
    const accessRights = await this.roleStorage.get(sub);

    // TODO: renew instead of kick out
    if (!accessRights) {
      throw new LogoutRequiredException();
    }
    console.log(requiredRights);
    console.log(accessRights);

    return requiredRights.some((role) =>
      accessRights.some((right) => right === role),
    );
  }
}
