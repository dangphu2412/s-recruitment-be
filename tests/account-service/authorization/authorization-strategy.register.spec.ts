import { Logger } from '@nestjs/common';

import { AuthorizationStrategy } from 'src/account-service/authorization/interfaces/authorization-strategy.interface';
import {
  registerStrategy,
  StrategiesStorage,
} from '../../../src/account-service/authorization/services/authorization-strategy.register';

describe('registerStrategy', () => {
  let mockStrategy: jest.Mocked<AuthorizationStrategy>;

  beforeEach(() => {
    StrategiesStorage.clear();
    jest.spyOn(Logger, 'log').mockImplementation(() => {});
    mockStrategy = {
      canAccess: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should register a strategy and log initialization', () => {
    registerStrategy('test-strategy', mockStrategy);

    expect(Logger.log).toHaveBeenCalledWith(
      'Initializing strategy test-strategy',
      'AuthorizationStrategy',
    );

    expect(StrategiesStorage.get('test-strategy')).toBe(mockStrategy);
  });

  it('should override existing strategy with the same identifier', () => {
    const firstStrategy = { authorize: jest.fn() } as any;
    const secondStrategy = { authorize: jest.fn() } as any;

    registerStrategy('dup-strategy', firstStrategy);
    registerStrategy('dup-strategy', secondStrategy);

    expect(StrategiesStorage.size).toBe(1);
    expect(StrategiesStorage.get('dup-strategy')).toBe(secondStrategy);
  });
});
