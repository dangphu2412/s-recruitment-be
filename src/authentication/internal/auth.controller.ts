import { Body, Controller, Delete, Inject, Post } from '@nestjs/common';
import {
  AuthService,
  AuthServiceToken,
  BasicLoginDto,
  RenewTokensDto,
} from '../client';
import { RoleStorage, RoleStorageToken } from '../../authorization';
import { extractJwtPayload } from './utils/jwt.utils';
import { ApiNoContentResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(AuthServiceToken)
    private readonly authService: AuthService,
    @Inject(RoleStorageToken)
    private readonly roleStorage: RoleStorage,
  ) {}

  @Post('login')
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({
    status: 422,
    description: 'AUTH__INCORRECT_USERNAME_OR_PASSWORD',
  })
  public login(@Body() basicLoginDto: BasicLoginDto) {
    return this.authService.login(basicLoginDto);
  }

  @Post('tokens/renew')
  public renewAccessToken(@Body() renewTokensDto: RenewTokensDto) {
    return this.authService.renewTokens(renewTokensDto.refreshToken);
  }

  @ApiNoContentResponse()
  @Delete('logout')
  public logout(@Body() renewTokensDto: RenewTokensDto) {
    const jwtPayload = extractJwtPayload(renewTokensDto.refreshToken);
    if (!jwtPayload) {
      return;
    }

    return this.roleStorage.clean(jwtPayload.sub);
  }
}
