import {
  BasicLoginDTO,
  UserCredentialsDTO,
} from '../dtos/core/login-credentials.dto';
import { UpdateMyPasswordRequest } from '../dtos/presentations/update-my-password.request';

export const AuthService = Symbol('AuthService');

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDTO): Promise<UserCredentialsDTO>;
  renewTokens(refreshToken: string): Promise<UserCredentialsDTO>;
  logOut(refreshToken: string): Promise<void>;
  updateMyPassword(
    myId: string,
    updateMyPassword: UpdateMyPasswordRequest,
  ): Promise<void>;
}
