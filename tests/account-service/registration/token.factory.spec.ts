import { JwtService } from '@nestjs/jwt';
import { TokenGeneratorImpl } from '../../../src/account-service/registration/services/token-factory';
import { EnvironmentKeyFactory } from '../../../src/system/services';

describe('TokenGeneratorImpl', () => {
  let tokenGenerator: TokenGeneratorImpl;
  let jwtService: jest.Mocked<JwtService>;
  let environmentKeyFactory: jest.Mocked<EnvironmentKeyFactory>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn(),
    } as any;

    environmentKeyFactory = {
      getAccessTokenExpiration: jest.fn().mockReturnValue('15m'),
      getRefreshTokenExpiration: jest.fn().mockReturnValue('7d'),
    } as any;

    tokenGenerator = new TokenGeneratorImpl(jwtService, environmentKeyFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tokenGenerator).toBeDefined();
  });

  describe('create()', () => {
    it('should create new access and refresh tokens', async () => {
      jwtService.signAsync
        .mockResolvedValueOnce('mocked_access_token') // for accessToken
        .mockResolvedValueOnce('mocked_refresh_token'); // for refreshToken

      const result = await tokenGenerator.create('user-id-123');

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id-123' },
        { expiresIn: '15m' },
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id-123' },
        { expiresIn: '7d' },
      );

      expect(result).toEqual([
        {
          name: 'accessToken',
          type: 'Bearer ',
          value: 'mocked_access_token',
        },
        {
          name: 'refreshToken',
          type: 'Bearer ',
          value: 'mocked_refresh_token',
        },
      ]);
    });

    it('should reuse provided refresh token', async () => {
      jwtService.signAsync.mockResolvedValueOnce('mocked_access_token');

      const result = await tokenGenerator.create(
        'user-id-123',
        'provided_refresh_token',
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(1);

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: 'user-id-123' },
        { expiresIn: '15m' },
      );

      expect(result).toEqual([
        {
          name: 'accessToken',
          type: 'Bearer ',
          value: 'mocked_access_token',
        },
        {
          name: 'refreshToken',
          type: 'Bearer ',
          value: 'provided_refresh_token',
        },
      ]);
    });
  });
});
