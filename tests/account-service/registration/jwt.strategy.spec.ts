import { EnvironmentKeyFactory } from '../../../src/system/services';
import { JwtStrategy } from '../../../src/account-service/registration/services/jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let environmentKeyFactory: jest.Mocked<EnvironmentKeyFactory>;

  beforeEach(() => {
    environmentKeyFactory = {
      getJwtConfig: jest.fn().mockReturnValue({ secret: 'mock_secret_key' }),
    } as any;

    jwtStrategy = new JwtStrategy(environmentKeyFactory);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should call EnvironmentKeyFactory.getJwtConfig in constructor', () => {
    expect(environmentKeyFactory.getJwtConfig).toHaveBeenCalled();
  });

  describe('validate', () => {
    it('should return payload as is', () => {
      const payload = { sub: 'user-id', username: 'john' };
      expect(jwtStrategy.validate(payload)).toEqual(payload);
    });
  });
});
