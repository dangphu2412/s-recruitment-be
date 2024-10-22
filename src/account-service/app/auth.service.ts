import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractJwtPayload } from './jwt.utils';
import isEmpty from 'lodash/isEmpty';
import { PasswordManager } from './password-manager';
import { BasicLoginRequestDto } from '../adapters/dtos';
import { LoginCredentials } from '../domain/dtos/login.credentials';
import {
  IncorrectUsernamePasswordException,
  InvalidTokenFormatException,
  LogoutRequiredException,
} from '../domain/exceptions';
import {
  AuthService,
  TokenGenerator,
  TokenGeneratorToken,
} from '../domain/interfaces';
import {
  UserService,
  UserServiceToken,
} from '../domain/interfaces/user-service';
import { JwtPayload } from '../domain/dtos/jwt-payload';
import {
  RoleService,
  RoleServiceToken,
} from '../domain/interfaces/role.service';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
    @Inject(TokenGeneratorToken)
    private readonly tokenGenerator: TokenGenerator,
    private readonly jwtService: JwtService,
    private readonly passwordManager: PasswordManager,
  ) {}

  logOut(refreshToken: string): Promise<void> {
    const jwtPayload = extractJwtPayload(refreshToken);
    if (!jwtPayload) {
      return;
    }

    return this.roleService.clean(jwtPayload.sub);
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
      (await this.passwordManager.compare(password, user.password));

    if (cannotLogin) {
      throw new IncorrectUsernamePasswordException();
    }

    const [tokens] = await Promise.all([
      this.tokenGenerator.generate(user.id),
      this.roleService.save(user.id, user.roles),
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
        this.roleService.save(user.id, user.roles),
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

      await this.roleService.clean(jwtPayload.sub);

      throw new LogoutRequiredException();
    }
  }
}
