import { createInterfaceToken } from '../../../system/utils';
import {
  BasicLoginDTO,
  UserCredentialsDTO,
} from '../dtos/core/login-credentials.dto';

export const AuthServiceToken = createInterfaceToken('AuthService');

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDTO): Promise<UserCredentialsDTO>;
  renewTokens(refreshToken: string): Promise<UserCredentialsDTO>;
  logOut(refreshToken: string): Promise<void>;
}
