import { extractJwtPayload } from '../../../src/account-service/registration/services/jwt.utils';
import { JwtPayload } from '../../../src/account-service/registration/jwt-payload';

describe('extractJwtPayload', () => {
  it('should decode a valid JWT payload', () => {
    const payload: JwtPayload = { sub: '123' };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const token = `header.${base64Payload}.signature`;

    const result = extractJwtPayload(token);

    expect(result).toEqual(payload);
  });

  it('should return null if token does not contain a payload part', () => {
    const token = 'header..signature';

    const result = extractJwtPayload(token);

    expect(result).toBeNull();
  });

  it('should throw if payload is not valid JSON', () => {
    const invalidBase64 = Buffer.from('not-json').toString('base64url');
    const token = `header.${invalidBase64}.signature`;

    expect(() => extractJwtPayload(token)).toThrow();
  });

  it('should handle numeric payload values correctly', () => {
    const payload: JwtPayload = { sub: '123' };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const token = `header.${base64Payload}.signature`;

    const result = extractJwtPayload(token);

    expect(result).toEqual(payload);
  });
});
