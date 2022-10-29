import { TokenDto } from '../types';
import { createInterfaceToken } from '../../../utils';

export const TokenGeneratorToken = createInterfaceToken('TokenGenerator');

export interface TokenGenerator {
  generate(userId: string): Promise<TokenDto[]>;
  generate(userId: string, providedRefreshToken: string): Promise<TokenDto[]>;
}
