import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Identified } from './decorators';
import { CanAccessBy } from './decorators/can-access-by.decorator';
import { Page } from '../../system/query-shape/types';
import { UpdateUserRolesDto } from '../domain/dtos/update-user-roles.dto';
import { FileInterceptor } from '../../system/file';
import { FileCreateUsersDto } from '../domain/dtos/file-create-users.dto';
import { Permissions } from '../domain/constants/role-def.enum';
import { GetUsersQueryRequest } from '../domain/presentation/dto/get-users-query.request';
import { UserManagementViewDTO } from '../domain/core/dto/users.dto';
import {
  UserService,
  UserServiceToken,
} from '../domain/core/services/user-service';
import { JwtPayload } from '../domain/dtos/jwt-payload';
import { CreateUsersDto } from '../domain/presentation/dto/create-users.dto';
import { PaymentService } from '../../monthly-money/internal/payment.service';
import { CreatePaymentRequest } from '../domain/presentation/dto/create-payment.request';
import { UpgradeUserMemberRequest } from '../domain/presentation/dto/upgrade-user-member.request';
import { UserProbationRequest } from '../domain/presentation/dto/get-users-probation.request';
import { UpdateUserRequest } from '../domain/presentation/dto/update-user.request';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(UserServiceToken)
    private readonly domainUser: UserService,
    private readonly paymentService: PaymentService,
  ) {}

  @Identified
  @Get('/me')
  @ApiOkResponse()
  findMyProfile(@CurrentUser() user: JwtPayload) {
    return this.domainUser.findMyProfile(user.sub);
  }

  @CanAccessBy(Permissions.VIEW_USERS, Permissions.EDIT_MEMBER_USER)
  @Get('/:id')
  findUserDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.domainUser.findUserDetail(userId);
  }

  @CanAccessBy(Permissions.VIEW_USERS, Permissions.EDIT_MEMBER_USER)
  @Get('/')
  @ApiOkResponse()
  async searchOverviewUsers(
    @Query() query: GetUsersQueryRequest,
  ): Promise<Page<UserManagementViewDTO>> {
    return this.domainUser.findUsers(query);
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.domainUser.toggleUserIsActive(id);
  }

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
  @Get('/:id/roles')
  @ApiOkResponse()
  findUserWithRoles(@Param('id') userId: string) {
    return this.domainUser.findOne({
      id: userId,
      withRoles: true,
    });
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Patch('/:id')
  @ApiNoContentResponse()
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRequest,
  ) {
    await this.domainUser.updateUser({
      ...dto,
      id: userId,
    });
  }

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
  @Patch('/:id/roles')
  @ApiNoContentResponse()
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    await this.domainUser.updateUserRoles(userId, dto);
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.domainUser.createUser(createUsersDto);
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  createUsersByFile(
    @Body() dto: FileCreateUsersDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.domainUser.createUsersByFile({ ...dto, file });
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Post('/:userId/payments')
  async createUserPayment(
    @Body() createPaymentDto: CreatePaymentRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.domainUser.createUserPayment(userId, createPaymentDto);
  }

  @CanAccessBy(Permissions.VIEW_USERS)
  @Get('/:userId/payments')
  async findUserPayments(@Param('userId') userId: string) {
    return this.paymentService.findUserPaymentsByUserId(userId);
  }

  @CanAccessBy(Permissions.VIEW_USERS)
  @Get('/probation')
  findProbationUsers(@Query() userProbationRequest: UserProbationRequest) {
    return this.domainUser.findProbationUsers(userProbationRequest);
  }

  @CanAccessBy(Permissions.EDIT_MEMBER_USER)
  @Patch('/members')
  upgradeToMembers(
    @Body() upgradeUserMemberInputDto: UpgradeUserMemberRequest,
  ) {
    return this.domainUser.upgradeToMembers(upgradeUserMemberInputDto);
  }
}
