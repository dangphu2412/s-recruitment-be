import { JwtPayload } from '../../client';
import { Nullable } from '../../../system/client/util.type';

export function extractJwtPayload(token: string): Nullable<JwtPayload> {
  const jwtPayloadSerialized = token.split('.')[1];

  if (!jwtPayloadSerialized) {
    return null;
  }

  return JSON.parse(Buffer.from(jwtPayloadSerialized, 'base64').toString());
}
