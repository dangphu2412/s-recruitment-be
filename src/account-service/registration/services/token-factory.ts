import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenDTO } from '../dtos/core/login-credentials.dto';
import { JwtPayload } from '../jwt-payload';
import { TokenFactory } from '../interfaces/token-factory.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenGeneratorImpl implements TokenFactory {
  private readonly accessTokenExpiration: string;
  private readonly refreshTokenExpiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.accessTokenExpiration = this.configService.getOrThrow(
      'ACCESS_TOKEN_EXPIRATION',
    );
    this.refreshTokenExpiration = this.configService.getOrThrow(
      'REFRESH_TOKEN_EXPIRATION',
    );
  }

  create(userId: string): Promise<TokenDTO[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDTO[]>;
  async create(
    userId: string,
    providedRefreshToken?: string,
  ): Promise<TokenDTO[]> {
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
