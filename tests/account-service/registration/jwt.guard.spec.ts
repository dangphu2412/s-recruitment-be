import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../src/account-service/registration/services/jwt.guard';
import { createSystemClientCode } from '../../../src/system/exception';

jest.mock('../../../src/system/exception', () => ({
  createSystemClientCode: jest.fn().mockReturnValue('UNAUTHORIZED_CUSTOM_CODE'),
}));

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(() => {
    jwtAuthGuard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user if user is valid', () => {
      const user = { id: 'user-id', username: 'john' };

      const result = jwtAuthGuard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user is missing', () => {
      expect(() => jwtAuthGuard.handleRequest(null, null)).toThrowError(
        UnauthorizedException,
      );
      expect(() => jwtAuthGuard.handleRequest(null, null)).toThrowError(
        expect.objectContaining({
          response: expect.objectContaining({
            statusCode: 401,
          }),
        }),
      );
      expect(createSystemClientCode).toHaveBeenCalledWith('UNAUTHORIZED');
    });

    it('should throw UnauthorizedException if there is an error', () => {
      const err = new Error('Token expired');
      expect(() => jwtAuthGuard.handleRequest(err, null)).toThrowError(
        UnauthorizedException,
      );
      expect(createSystemClientCode).toHaveBeenCalledWith('UNAUTHORIZED');
    });
  });
});
