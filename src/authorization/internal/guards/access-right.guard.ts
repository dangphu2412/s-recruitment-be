import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RoleAuthorizationStrategy } from '../strategies/role-authorization.strategy';
import { Reflector } from '@nestjs/core';
import { ACCESS_RIGHT_META_DATA_KEY } from '@authorization/internal/decorators/can-access-by.decorator';
import { StrategiesStorage } from '@authorization/internal/strategies/authorization-strategy.register';

@Injectable()
export class AccessRightGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRights = this.reflector.getAllAndOverride<string[]>(
      ACCESS_RIGHT_META_DATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    const { user } = context.switchToHttp().getRequest();
    const strategy = StrategiesStorage.get(RoleAuthorizationStrategy.name);
    const canAccess = await strategy.canAccess(user, requiredRights);

    if (!canAccess) {
      throw new ForbiddenException();
    }

    return true;
  }
}
