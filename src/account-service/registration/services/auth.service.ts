import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractJwtPayload } from './jwt.utils';
import isEmpty from 'lodash/isEmpty';
import { PasswordManager } from './password-manager';
import { UserCredentialsDTO } from '../dtos/core/login-credentials.dto';
import {
  UserService,
  UserServiceToken,
} from '../../management/interfaces/user-service.interface';
import { JwtPayload } from '../jwt-payload';
import {
  RoleService,
  RoleServiceToken,
} from '../../authorization/interfaces/role-service.interface';
import { BasicLoginRequestDto } from '../dtos/presentations/basic-login.request.dto';
import {
  TokenFactory,
  TokenFactoryToken,
} from '../interfaces/token-factory.interface';
import { AuthService } from '../interfaces/auth-service.interface';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
    @Inject(TokenFactoryToken)
    private readonly tokenFactory: TokenFactory,
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
  }: BasicLoginRequestDto): Promise<UserCredentialsDTO> {
    const user = await this.userService.findOne({
      username,
    });

    if (
      isEmpty(user) ||
      !(await this.passwordManager.compare(password, user.password))
    ) {
      throw new NotFoundException('Incorrect username or password');
    }

    const [tokens] = await Promise.all([
      this.tokenFactory.create(user.id),
      this.roleService.findPermissionsByUserId(user.id),
    ]);

    return {
      tokens,
    };
  }

  async renewTokens(refreshToken: string): Promise<UserCredentialsDTO> {
    try {
      const { sub } =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      const tokens = await this.tokenFactory.create(sub, refreshToken);

      return {
        tokens,
      };
    } catch {
      const jwtPayload = extractJwtPayload(refreshToken);

      if (!jwtPayload) {
        throw new InternalServerErrorException();
      }

      await this.roleService.clean(jwtPayload.sub);

      throw new BadRequestException();
    }
  }
}
