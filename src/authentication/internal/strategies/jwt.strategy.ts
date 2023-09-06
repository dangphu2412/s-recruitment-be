import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../client';
import { EnvironmentKeyFactory } from '../../../system/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(environmentKeyFactory: EnvironmentKeyFactory) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: environmentKeyFactory.getJwtConfig().secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
