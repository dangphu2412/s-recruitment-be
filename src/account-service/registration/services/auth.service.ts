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
import { JwtPayload } from '../jwt-payload';
import { RoleService } from '../../authorization/interfaces/role-service.interface';
import { BasicLoginRequestDto } from '../dtos/presentations/basic-login.request.dto';
import { TokenFactory } from '../interfaces/token-factory.interface';
import { AuthService } from '../interfaces/auth-service.interface';
import { UpdateMyPasswordRequest } from '../dtos/presentations/update-my-password.request';
import { LogOutRequiredException } from '../exceptions/log-out-required.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../system/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthServiceImpl implements AuthService {
  constructor(
    @Inject(RoleService)
    private readonly roleService: RoleService,
    @Inject(TokenFactory)
    private readonly tokenFactory: TokenFactory,
    private readonly jwtService: JwtService,
    private readonly passwordManager: PasswordManager,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async logOut(refreshToken: string): Promise<void> {
    const jwtPayload = extractJwtPayload(refreshToken);

    if (!jwtPayload) {
      return;
    }

    await this.roleService.clean(jwtPayload.sub);
  }

  async login({
    username,
    password,
  }: BasicLoginRequestDto): Promise<UserCredentialsDTO> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (
      !user ||
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

      throw new LogOutRequiredException();
    }
  }

  async updateMyPassword(
    myId: string,
    updateMyPassword: UpdateMyPasswordRequest,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({
      id: myId,
    });

    if (
      isEmpty(user) ||
      !(await this.passwordManager.compare(
        updateMyPassword.currentPassword,
        user.password,
      ))
    ) {
      throw new BadRequestException('Incorrect password');
    }

    if (updateMyPassword.currentPassword === updateMyPassword.newPassword) {
      throw new BadRequestException('New password should not be the same');
    }

    await this.userRepository.update(
      { id: user.id },
      {
        password: await this.passwordManager.generate(
          updateMyPassword.newPassword,
        ),
      },
    );
  }
}
