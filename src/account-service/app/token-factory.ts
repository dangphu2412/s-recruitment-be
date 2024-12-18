import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentKeyFactory } from 'src/system/services';
import { TokenFactory } from '../domain/core/services';
import { TokenDto } from '../domain/dtos/login.credentials';
import { JwtPayload } from '../domain/dtos/jwt-payload';

@Injectable()
export class TokenGeneratorImpl implements TokenFactory {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    environmentKeyFactory: EnvironmentKeyFactory,
  ) {
    this.accessTokenExpiration =
      environmentKeyFactory.getAccessTokenExpiration();
    this.refreshTokenExpiration =
      environmentKeyFactory.getRefreshTokenExpiration();
  }

  create(userId: string): Promise<TokenDto[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDto[]>;
  async create(
    userId: string,
    providedRefreshToken?: string,
  ): Promise<TokenDto[]> {
    const jwtPayload: JwtPayload = {
      sub: userId,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      expiresIn: this.accessTokenExpiration,
    });

    const refreshToken = providedRefreshToken
      ? providedRefreshToken
      : await this.jwtService.signAsync(jwtPayload, {
          expiresIn: this.refreshTokenExpiration,
        });

    return [
      {
        name: 'accessToken',
        type: 'Bearer ',
        value: accessToken,
      },
      {
        name: 'refreshToken',
        type: 'Bearer ',
        value: refreshToken,
      },
    ];
  }
}
