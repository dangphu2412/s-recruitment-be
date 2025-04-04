import { genSalt, hash, compare } from 'bcryptjs';
import { EnvironmentKeyFactory } from '../../../src/system/services';
import { PasswordManager } from '../../../src/account-service/registration/services/password-manager';

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe(PasswordManager.name, () => {
  let passwordManager: PasswordManager;
  let configService: jest.Mocked<EnvironmentKeyFactory>;

  beforeEach(() => {
    configService = {
      getSaltRounds: jest.fn().mockReturnValue(10),
      getDefaultPwd: jest.fn().mockReturnValue('default123'),
    } as any;

    passwordManager = new PasswordManager(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate hashed password', async () => {
      (genSalt as jest.Mock).mockResolvedValue('mocked_salt');
      (hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await passwordManager.generate('myPassword');

      expect(genSalt).toHaveBeenCalledWith(10);
      expect(hash).toHaveBeenCalledWith('myPassword', 'mocked_salt');
      expect(result).toBe('hashed_password');
    });
  });

  describe('compare', () => {
    it('should compare passwords', async () => {
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await passwordManager.compare('plain', 'hashed');
      expect(compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(result).toBe(true);
    });
  });

  describe('getDefaultPassword', () => {
    it('should generate and cache default password if not already set', async () => {
      (genSalt as jest.Mock).mockResolvedValue('salt_default');
      (hash as jest.Mock).mockResolvedValue('hashed_default_pwd');

      await passwordManager.onModuleInit();
      const result = passwordManager.getDefaultPassword();

      expect(configService.getDefaultPwd).toHaveBeenCalled();
      expect(hash).toHaveBeenCalledWith('default123', 'salt_default');
      expect(result).toBe('hashed_default_pwd');

      // Should return cached on next call
      const cachedResult = await passwordManager.getDefaultPassword();
      expect(cachedResult).toBe('hashed_default_pwd');
    });
  });
});
