import { LoginCredentials } from '../types';
import { BasicLoginDto } from '../dtos';
import { createInterfaceToken } from '../../../utils';

export const AuthServiceToken = createInterfaceToken('AuthService');

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDto): Promise<LoginCredentials>;

  renewTokens(refreshToken: string): Promise<LoginCredentials>;
}
