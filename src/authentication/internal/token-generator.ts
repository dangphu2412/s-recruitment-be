import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, TokenDto, TokenGenerator } from '../client';
import { ModuleConfig } from '@shared/services';

@Injectable()
export class TokenGeneratorImpl implements TokenGenerator {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    moduleConfig: ModuleConfig,
  ) {
    this.accessTokenExpiration = moduleConfig.getAccessTokenExpiration();
    this.refreshTokenExpiration = moduleConfig.getRefreshTokenExpiration();
  }

  generate(userId: string): Promise<TokenDto[]>;
  generate(userId: string, providedRefreshToken: string): Promise<TokenDto[]>;
  async generate(
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
