import { createProviderToken } from '../../../src/system/nestjs-extensions/provider-token.factory';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

jest.mock('@nestjs/common/utils/random-string-generator.util', () => ({
  randomStringGenerator: jest.fn().mockReturnValue('randomString'),
}));

describe('createProviderToken', () => {
  const mockRandomStringGenerator = randomStringGenerator as jest.Mock;

  it('should return true', () => {
    mockRandomStringGenerator.mockReturnValue('randomString');

    expect(createProviderToken('Name')).toBe('NamerandomString');
  });
});
