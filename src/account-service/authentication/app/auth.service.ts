import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DigestService } from 'src/system/services';
import { extractJwtPayload } from './jwt.utils';
import {
  AuthService,
  BasicLoginRequestDto,
  JwtPayload,
  LoginCredentials,
  TokenGenerator,
  TokenGeneratorToken,
} from '../domain';
import {
  AccessRightStorage,
  AccessRightStorageToken,
} from '../../authorization';
import { UserService, UserServiceToken } from '../../user';
import { IncorrectUsernamePasswordException } from '../domain/exceptions';
import { InvalidTokenFormatException } from '../domain/exceptions/invalid-token-format.exception';
import { LogoutRequiredException } from '../domain/exceptions/logout-required.exception';
import isEmpty from 'lodash/isEmpty';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    @Inject(AccessRightStorageToken)
    private readonly accessRightStorage: AccessRightStorage,
    @Inject(TokenGeneratorToken)
    private readonly tokenGenerator: TokenGenerator,
    private readonly jwtService: JwtService,
    private readonly digestService: DigestService,
  ) {}

  logOut(refreshToken: string): Promise<void> {
    const jwtPayload = extractJwtPayload(refreshToken);
    if (!jwtPayload) {
      return;
    }

    return this.accessRightStorage.clean(jwtPayload.sub);
  }

  async login({
    username,
    password,
  }: BasicLoginRequestDto): Promise<LoginCredentials> {
    const user = await this.userService.findOne({
      username,
      withRights: true,
    });

    const cannotLogin =
      isEmpty(user) ||
      (await this.digestService.compare(password, user.password));

    if (cannotLogin) {
      throw new IncorrectUsernamePasswordException();
    }

    const [tokens] = await Promise.all([
      this.tokenGenerator.generate(user.id),
      this.accessRightStorage.save(user.id, user.roles),
    ]);

    return {
      tokens,
    };
  }

  async renewTokens(refreshToken: string): Promise<LoginCredentials> {
    try {
      const { sub } = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
      );
      const user = await this.userService.findOne({
        id: sub,
        withRights: true,
      });

      const [tokens] = await Promise.all([
        this.tokenGenerator.generate(sub, refreshToken),
        this.accessRightStorage.save(user.id, user.roles),
      ]);

      // TODO: Missing access token in cache when server restart
      return {
        tokens,
      };
    } catch {
      const jwtPayload = extractJwtPayload(refreshToken);

      if (!jwtPayload) {
        throw new InvalidTokenFormatException();
      }

      await this.accessRightStorage.clean(jwtPayload.sub);

      throw new LogoutRequiredException();
    }
  }
}
