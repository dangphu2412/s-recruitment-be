import { TokenDTO } from '../dtos/core/login-credentials.dto';

export const TokenFactory = Symbol('TokenFactoryToken');

export interface TokenFactory {
  create(userId: string): Promise<TokenDTO[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDTO[]>;
}
