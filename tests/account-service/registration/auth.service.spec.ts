import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RoleService } from '../../../src/account-service/authorization/interfaces/role-service.interface';
import { AuthServiceImpl } from '../../../src/account-service/registration/services/auth.service';
import { UserService } from '../../../src/account-service/management/interfaces/user-service.interface';
import { PasswordManager } from '../../../src/account-service/registration/services/password-manager';
import { BasicLoginRequestDto } from '../../../src/account-service/registration/dtos/presentations/basic-login.request.dto';

import { extractJwtPayload } from '../../../src/account-service/registration/services/jwt.utils';
import { User } from '../../../src/account-service/shared/entities/user.entity';
import { TokenFactory } from '../../../src/account-service/registration/interfaces/token-factory.interface';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogOutRequiredException } from '../../../src/account-service/registration/exceptions/log-out-required.exception';

// Mock extractJwtPayload utility
jest.mock(
  '../../../src/account-service/registration/services/jwt.utils',
  () => ({
    extractJwtPayload: jest.fn(),
  }),
);

describe('AuthServiceImpl', () => {
  let authService: AuthServiceImpl;
  let userService: jest.Mocked<UserService>;
  let roleService: jest.Mocked<RoleService>;
  let tokenFactory: jest.Mocked<TokenFactory>;
  let jwtService: jest.Mocked<JwtService>;
  let passwordManager: jest.Mocked<PasswordManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceImpl,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            clean: jest.fn(),
            findPermissionsByUserId: jest.fn(),
          },
        },
        {
          provide: TokenFactory,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PasswordManager,
          useValue: {
            compare: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthServiceImpl>(AuthServiceImpl);
    userService = module.get(UserService);
    roleService = module.get(RoleService);
    tokenFactory = module.get(TokenFactory);
    jwtService = module.get(JwtService);
    passwordManager = module.get(PasswordManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const dto: BasicLoginRequestDto = {
        username: 'john',
        password: 'secret',
      };
      const user = {
        id: 'user-id',
        password: 'hashed',
        roles: ['admin'],
      } as unknown as User;
      const tokens = [
        {
          type: 'Bearer',
          name: 'accessToken',
          value: 'accessToken',
        },
      ];

      userService.findOne.mockResolvedValue(user);
      passwordManager.compare.mockResolvedValue(true);
      tokenFactory.create.mockResolvedValue(tokens);
      roleService.findPermissionsByUserId.mockResolvedValue(undefined);

      const result = await authService.login(dto);

      expect(userService.findOne).toHaveBeenCalledWith({
        username: 'john',
      });
      expect(passwordManager.compare).toHaveBeenCalledWith('secret', 'hashed');
      expect(tokenFactory.create).toHaveBeenCalledWith('user-id');
      expect(roleService.findPermissionsByUserId).toHaveBeenCalledWith(
        'user-id',
      );
      expect(result).toEqual({ tokens });
    });

    it('should throw NotFoundException if user not found', async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(
        authService.login({ username: 'john', password: 'wrong' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if password is wrong', async () => {
      const user = {
        id: 'user-id',
        password: 'hashed',
        roles: [],
      } as unknown as User;
      userService.findOne.mockResolvedValue(user);
      passwordManager.compare.mockResolvedValue(false);

      await expect(
        authService.login({ username: 'john', password: 'wrong' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('renewTokens', () => {
    it('should return new tokens if verifyAsync succeeds', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-id' });
      tokenFactory.create.mockResolvedValue([
        {
          type: 'Bearer',
          name: 'accessToken',
          value: 'accessToken',
        },
      ]);

      const result = await authService.renewTokens('valid_refresh');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid_refresh');
      expect(tokenFactory.create).toHaveBeenCalledWith(
        'user-id',
        'valid_refresh',
      );
      expect(result).toEqual({
        tokens: [
          {
            type: 'Bearer',
            name: 'accessToken',
            value: 'accessToken',
          },
        ],
      });
    });

    it('should clean and throw BadRequestException on token verification failure', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      (extractJwtPayload as jest.Mock).mockReturnValue({ sub: 'user-id' });

      await expect(authService.renewTokens('bad_refresh')).rejects.toThrow(
        LogOutRequiredException,
      );

      expect(roleService.clean).toHaveBeenCalledWith('user-id');
    });

    it('should throw InvalidTokenFormatException if extractJwtPayload fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      (extractJwtPayload as jest.Mock).mockReturnValue(null);

      await expect(authService.renewTokens('invalid_refresh')).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(roleService.clean).not.toHaveBeenCalled();
    });
  });

  describe('logOut', () => {
    it('should clean roles if refreshToken is valid', async () => {
      (extractJwtPayload as jest.Mock).mockReturnValue({ sub: 'user-id' });

      await authService.logOut('some_refresh');
      expect(roleService.clean).toHaveBeenCalledWith('user-id');
    });

    it('should do nothing if extractJwtPayload returns null', async () => {
      (extractJwtPayload as jest.Mock).mockReturnValue(null);

      await authService.logOut('invalid_refresh');
      expect(roleService.clean).not.toHaveBeenCalled();
    });
  });
});
