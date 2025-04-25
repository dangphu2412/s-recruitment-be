import { JwtStrategy } from '../../../src/account-service/registration/services/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockReturnValue('mock_secret_key'),
    } as any;

    jwtStrategy = new JwtStrategy(configService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return payload as is', () => {
      const payload = { sub: 'user-id', username: 'john' };
      expect(jwtStrategy.validate(payload)).toEqual(payload);
    });
  });
});
