import { createInterfaceToken } from '../../../../system/utils';
import { TokenDto } from '../../dtos/login.credentials';

export const TokenGeneratorToken = createInterfaceToken('TokenGenerator');

export interface TokenGenerator {
  generate(userId: string): Promise<TokenDto[]>;
  generate(userId: string, providedRefreshToken: string): Promise<TokenDto[]>;
}
