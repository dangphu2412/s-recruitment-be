import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../src/account-service/registration/services/jwt.guard';

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
    });

    it('should throw UnauthorizedException if there is an error', () => {
      const err = new Error('Token expired');
      expect(() => jwtAuthGuard.handleRequest(err, null)).toThrowError(
        UnauthorizedException,
      );
    });
  });
});
