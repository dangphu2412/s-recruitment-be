import { createInterfaceToken } from '../../../../system/utils';
import { TokenDTO } from '../../../registration/dtos/core/login-credentials.dto';

export const TokenFactoryToken = createInterfaceToken('TokenFactoryToken');

export interface TokenFactory {
  create(userId: string): Promise<TokenDTO[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDTO[]>;
}
