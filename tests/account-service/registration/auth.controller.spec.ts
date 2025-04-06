import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/account-service/registration/controllers/auth.controller';
import { BasicLoginRequestDto } from '../../../src/account-service/registration/dtos/presentations/basic-login.request.dto';
import { RenewTokensRequestDto } from '../../../src/account-service/registration/dtos/presentations/renew-tokens.request.dto';
import {
  AuthService,
  AuthServiceToken,
} from 'src/account-service/registration/interfaces/auth-service.interface';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    renewTokens: jest.fn(),
    logOut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthServiceToken,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthServiceToken);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto: BasicLoginRequestDto = { username: 'test', password: 'pass' };
      const mockResponse = { accessToken: 'token', refreshToken: 'refresh' };
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await authController.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('renewAccessToken', () => {
    it('should call authService.renewTokens and return result', async () => {
      const dto: RenewTokensRequestDto = { refreshToken: 'refresh_token' };
      const mockResponse = {
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
      };
      mockAuthService.renewTokens.mockResolvedValue(mockResponse);

      const result = await authController.renewAccessToken(dto);

      expect(authService.renewTokens).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should call authService.logOut', async () => {
      const dto: RenewTokensRequestDto = { refreshToken: 'refresh_token' };
      mockAuthService.logOut.mockResolvedValue(undefined);

      const result = await authController.logout(dto);

      expect(authService.logOut).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toBeUndefined();
    });
  });
});
