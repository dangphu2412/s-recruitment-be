import { createProviderToken } from '../../../system/nestjs-extensions';
import { TokenDTO } from '../dtos/core/login-credentials.dto';

export const TokenFactoryToken = createProviderToken('TokenFactoryToken');

export interface TokenFactory {
  create(userId: string): Promise<TokenDTO[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDTO[]>;
}
