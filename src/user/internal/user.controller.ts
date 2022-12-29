import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Identified, JwtPayload } from '../../authentication';
import { APP_RBAC, CanAccessBy } from '../../authorization';
import {
  CreateUsersDto,
  ExtractNewUserQueryDto,
  SearchUserService,
  SearchUserServiceToken,
  UserManagementQueryDto,
  UserManagementView,
  UserService,
  UserServiceToken,
} from '../client';
import { UpdateMemberPaidDto } from '../client/dtos/update-member-paid.dto';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import { Page } from '@shared/query-shape/pagination/types';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    @Inject(SearchUserServiceToken)
    private readonly searchUserService: SearchUserService,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
  ) {}

  @Identified
  @Get('/me')
  @ApiOkResponse()
  findMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findMyProfile(user.sub);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Get('/')
  @ApiOkResponse()
  async search(
    @Query() query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    return this.searchUserService.search(query);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.userService.createUserUseCase(createUsersDto);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Get('/extract-new-values')
  @ApiCreatedResponse()
  extractNewUserEmails(
    @Query() extractNewUserQueryDto: ExtractNewUserQueryDto,
  ) {
    return this.userService.extractNewUserEmails(extractNewUserQueryDto.value);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Patch('/:id/monthly-moneys')
  @ApiNoContentResponse()
  updateMemberPaid(
    @Param('id') userId: string,
    @Body() { newPaid, operationFeeId }: UpdateMemberPaidDto,
  ) {
    return this.moneyOperationService.updateNewPaid({
      userId,
      newPaid,
      operationFeeId,
    });
  }
}
