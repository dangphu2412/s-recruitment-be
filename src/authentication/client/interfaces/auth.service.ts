import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { LoginCredentials } from '../types';
import { BasicLoginDto } from '../dtos';

export const AuthServiceToken = randomStringGenerator();

export interface AuthService {
  login(basicLoginRequestDto: BasicLoginDto): Promise<LoginCredentials>;

  renewTokens(refreshToken: string): Promise<LoginCredentials>;
}
