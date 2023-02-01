import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from '@shared/services';
import { extractJwtPayload } from './utils/jwt.utils';
import {
  AuthService,
  BasicLoginDto,
  JwtPayload,
  LoginCredentials,
  TokenGenerator,
  TokenGeneratorToken,
} from '../client';
import { AccessRightStorage, RoleStorageToken } from '../../authorization';
import { UserService, UserServiceToken } from '../../user';
import { IncorrectUsernamePasswordException } from '../client/exceptions';
import { InvalidTokenFormatException } from '../client/exceptions/invalid-token-format.exception';
import { LogoutRequiredException } from '../client/exceptions/logout-required.exception';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    @Inject(RoleStorageToken)
    private readonly roleStorage: AccessRightStorage,
    @Inject(TokenGeneratorToken)
    private readonly tokenGenerator: TokenGenerator,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  async login(basicLoginDto: BasicLoginDto): Promise<LoginCredentials> {
    const user = await this.userService.findByUsername(basicLoginDto.username, [
      'roles',
      'roles.permissions',
    ]);
    const cannotLogin =
      !user ||
      (await this.bcryptService.compare(basicLoginDto.password, user.password));

    if (cannotLogin) {
      throw new IncorrectUsernamePasswordException();
    }

    const [tokens] = await Promise.all([
      this.tokenGenerator.generate(user.id),
      this.roleStorage.set(
        user.id,
        user.roles
          .map((role) => role.permissions.map((permission) => permission.name))
          .flat(),
      ),
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

      return {
        tokens: await this.tokenGenerator.generate(sub, refreshToken),
      };
    } catch {
      const jwtPayload = extractJwtPayload(refreshToken);

      if (!jwtPayload) {
        throw new InvalidTokenFormatException();
      }

      await this.roleStorage.clean(jwtPayload.sub);

      throw new LogoutRequiredException();
    }
  }
}
