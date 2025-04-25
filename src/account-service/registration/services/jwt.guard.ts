import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthGuard } from '@nestjs/passport/dist/auth.guard';

// https://docs.nestjs.com/recipes/passport#implement-protected-route-and-jwt-strategy-guards
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  override handleRequest(err: Error, user) {
    if (err || !user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
