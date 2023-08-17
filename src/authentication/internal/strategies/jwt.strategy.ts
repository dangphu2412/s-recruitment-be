import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../client';
import { ModuleConfig } from '../../../system/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(moduleConfig: ModuleConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: moduleConfig.getJwtConfig().secret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
