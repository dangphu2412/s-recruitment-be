import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  RoleService,
  RoleServiceToken,
} from '../../../src/account-service/domain/core/services/role.service';
import { AuthServiceImpl } from '../../../src/account-service/registration/services/auth.service';
import {
  UserService,
  UserServiceToken,
} from '../../../src/account-service/domain/core/services/user-service';
import {
  TokenFactory,
  TokenFactoryToken,
} from '../../../src/account-service/domain/core/services';
import { PasswordManager } from '../../../src/account-service/registration/services/password-manager';
import { BasicLoginRequestDto } from '../../../src/account-service/registration/dtos/presentations/basic-login.request.dto';
import {
  IncorrectUsernamePasswordException,
  InvalidTokenFormatException,
  LogoutRequiredException,
} from '../../../src/account-service/domain/core/exceptions';
import { extractJwtPayload } from '../../../src/account-service/registration/services/jwt.utils';
import { User } from '../../../src/account-service/domain/data-access/entities/user.entity';

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
          provide: UserServiceToken,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: RoleServiceToken,
          useValue: {
            clean: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TokenFactoryToken,
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
    userService = module.get(UserServiceToken);
    roleService = module.get(RoleServiceToken);
    tokenFactory = module.get(TokenFactoryToken);
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
      roleService.save.mockResolvedValue(undefined);

      const result = await authService.login(dto);

      expect(userService.findOne).toHaveBeenCalledWith({
        username: 'john',
        withRights: true,
      });
      expect(passwordManager.compare).toHaveBeenCalledWith('secret', 'hashed');
      expect(tokenFactory.create).toHaveBeenCalledWith('user-id');
      expect(roleService.save).toHaveBeenCalledWith('user-id', ['admin']);
      expect(result).toEqual({ tokens });
    });

    it('should throw IncorrectUsernamePasswordException if user not found', async () => {
      userService.findOne.mockResolvedValue(null);
      await expect(
        authService.login({ username: 'john', password: 'wrong' }),
      ).rejects.toThrow(IncorrectUsernamePasswordException);
    });

    it('should throw IncorrectUsernamePasswordException if password is wrong', async () => {
      const user = {
        id: 'user-id',
        password: 'hashed',
        roles: [],
      } as unknown as User;
      userService.findOne.mockResolvedValue(user);
      passwordManager.compare.mockResolvedValue(false);

      await expect(
        authService.login({ username: 'john', password: 'wrong' }),
      ).rejects.toThrow(IncorrectUsernamePasswordException);
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

    it('should clean and throw LogoutRequiredException on token verification failure', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      (extractJwtPayload as jest.Mock).mockReturnValue({ sub: 'user-id' });

      await expect(authService.renewTokens('bad_refresh')).rejects.toThrow(
        LogoutRequiredException,
      );

      expect(roleService.clean).toHaveBeenCalledWith('user-id');
    });

    it('should throw InvalidTokenFormatException if extractJwtPayload fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error());
      (extractJwtPayload as jest.Mock).mockReturnValue(null);

      await expect(authService.renewTokens('invalid_refresh')).rejects.toThrow(
        InvalidTokenFormatException,
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
