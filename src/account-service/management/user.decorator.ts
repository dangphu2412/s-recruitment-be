import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../registration/jwt-payload';

export const CurrentUser = createParamDecorator(
  (propKey: keyof JwtPayload, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return propKey ? req.user[propKey] : (req.user as JwtPayload);
  },
);
