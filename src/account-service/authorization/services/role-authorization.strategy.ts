import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationStrategy } from 'src/account-service/authorization/interfaces/authorization-strategy.interface';
import { registerStrategy } from './authorization-strategy.register';
import { JwtPayload } from '../../registration/jwt-payload';
import {
  RoleService,
  RoleServiceToken,
} from '../interfaces/role-service.interface';
import { Permissions } from '../access-definition.constant';

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
    requiredPermissions: string[],
  ): Promise<boolean> {
    const permissions = await this.roleService.findPermissionsByUserId(sub);
    console.log(permissions);

    return requiredPermissions.some((requireRight) =>
      permissions.some(
        (right) => right === requireRight || right === Permissions.OWNER,
      ),
    );
  }
}
