import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationStrategy } from 'src/account-service/domain/core/services/authorization';
import { registerStrategy } from './authorization-strategy.register';
import { JwtPayload } from '../../registration/jwt-payload';
import {
  RoleService,
  RoleServiceToken,
} from '../../domain/core/services/role.service';

@Injectable()
export class RoleAuthorizationStrategy
  implements AuthorizationStrategy<JwtPayload, string[]>
{
  constructor(
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {
    registerStrategy(RoleAuthorizationStrategy.name, this);
  }

  async canAccess(
    { sub }: JwtPayload,
    requiredRights: string[],
  ): Promise<boolean> {
    const accessRights = await this.roleService.findAccessRightsByUserId(sub);

    return requiredRights.some((role) =>
      accessRights.some((right) => right === role),
    );
  }
}
