import { Inject, Injectable } from '@nestjs/common';
import {
  AccessRightStorage,
  AccessRightStorageToken,
  AuthorizationStrategy,
} from '../../domain';
import { JwtPayload } from 'src/account-service/authentication/domain';
import { registerStrategy } from './authorization-strategy.register';
import { LogoutRequiredException } from '../../../authentication/domain/exceptions/logout-required.exception';

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
