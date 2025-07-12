import { createProviderToken } from '../../../system/nestjs-extensions';
import {
  BasicLoginDTO,
  UserCredentialsDTO,
} from '../dtos/core/login-credentials.dto';
import { UpdateMyPasswordRequest } from '../dtos/presentations/update-my-password.request';

export const AuthServiceToken = createProviderToken('AuthService');

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDTO): Promise<UserCredentialsDTO>;
  renewTokens(refreshToken: string): Promise<UserCredentialsDTO>;
  logOut(refreshToken: string): Promise<void>;
  updateMyPassword(
    myId: string,
    updateMyPassword: UpdateMyPasswordRequest,
  ): Promise<void>;
}
