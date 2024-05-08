import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationStrategy } from 'src/account-service/domain/interfaces/authorization';
import { registerStrategy } from './authorization-strategy.register';
import { JwtPayload } from '../../domain/dtos/jwt-payload';
import {
  AccessRightStorage,
  AccessRightStorageToken,
} from '../../domain/interfaces/access-right-storage';
import { LogoutRequiredException } from '../../domain/exceptions';

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
    if (!accessRights?.length) {
      throw new LogoutRequiredException();
    }

    return requiredRights.some((role) =>
      accessRights.some((right) => right === role),
    );
  }
}
