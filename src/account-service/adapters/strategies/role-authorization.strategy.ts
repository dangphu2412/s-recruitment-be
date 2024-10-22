import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationStrategy } from 'src/account-service/domain/interfaces/authorization';
import { registerStrategy } from './authorization-strategy.register';
import { JwtPayload } from '../../domain/dtos/jwt-payload';
import {
  RoleService,
  RoleServiceToken,
} from '../../domain/interfaces/role.service';

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
    const accessRights = await this.roleService.getAccessRightsByUserId(sub);

    return requiredRights.some((role) =>
      accessRights.some((right) => right === role),
    );
  }
}
