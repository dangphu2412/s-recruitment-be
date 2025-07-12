import { Body, Controller, Delete, Inject, Post } from '@nestjs/common';
import { ApiNoContentResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicLoginRequestDto } from '../dtos/presentations/basic-login.request.dto';
import { RenewTokensRequestDto } from '../dtos/presentations/renew-tokens.request.dto';
import {
  AuthService,
  AuthServiceToken,
} from '../interfaces/auth-service.interface';
import { CurrentUser } from '../../management/user.decorator';
import { UpdateMyPasswordRequest } from '../dtos/presentations/update-my-password.request';
import { Identified } from '../identified.decorator';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    @Inject(AuthServiceToken)
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({
    status: 422,
    description: 'AUTH__INCORRECT_USERNAME_OR_PASSWORD',
  })
  public login(@Body() basicLoginDto: BasicLoginRequestDto) {
    return this.authService.login(basicLoginDto);
  }

  @Post('tokens/renew')
  public renewAccessToken(@Body() renewTokensDto: RenewTokensRequestDto) {
    return this.authService.renewTokens(renewTokensDto.refreshToken);
  }

  @ApiNoContentResponse()
  @Delete('logout')
  public logout(@Body() renewTokensDto: RenewTokensRequestDto) {
    return this.authService.logOut(renewTokensDto.refreshToken);
  }

  @Identified
  @Post('password')
  public updateMyPassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMyPasswordRequest,
  ) {
    return this.authService.updateMyPassword(userId, dto);
  }
}
