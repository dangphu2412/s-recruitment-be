import { createInterfaceToken } from '../../../../system/utils';
import { TokenDto } from '../../dtos/login.credentials';

export const TokenFactoryToken = createInterfaceToken('TokenFactoryToken');

export interface TokenFactory {
  create(userId: string): Promise<TokenDto[]>;
  create(userId: string, providedRefreshToken: string): Promise<TokenDto[]>;
}
