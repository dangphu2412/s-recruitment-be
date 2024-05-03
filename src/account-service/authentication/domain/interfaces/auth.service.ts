import { BasicLoginDto, LoginCredentials } from '../dtos';
import { createInterfaceToken } from '../../../../system/utils';

export const AuthServiceToken = createInterfaceToken('AuthService');

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDto): Promise<LoginCredentials>;
  renewTokens(refreshToken: string): Promise<LoginCredentials>;
  logOut(refreshToken: string): Promise<void>;
}
