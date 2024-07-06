import { createInterfaceToken } from '../app.utils';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

jest.mock('@nestjs/common/utils/random-string-generator.util', () => ({
  randomStringGenerator: jest.fn().mockReturnValue('randomString'),
}));

describe('createInterfaceToken', () => {
  const mockRandomStringGenerator = randomStringGenerator as jest.Mock;

  it('should return true', () => {
    mockRandomStringGenerator.mockReturnValue('randomString');

    expect(createInterfaceToken('Name')).toBe('NamerandomString');
  });
});
