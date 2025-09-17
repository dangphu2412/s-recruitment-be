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
import { CurrentUser } from '../user.decorator';
import { CanAccessBy } from '../../authorization/can-access-by.decorator';
import { UpdateUserRolesDto } from '../dtos/presentations/update-user-roles.dto';
import { FileInterceptor } from '../../../system/file/file.interceptor';
import { FileCreateUsersDto } from '../dtos/presentations/file-create-users.dto';
import { Permissions } from '../../authorization/access-definition.constant';
import {
  GetUsersQueryRequest,
  UserManagementViewDTO,
} from '../dtos/presentations/get-users-query.request';
import {
  UserService,
  UserServiceToken,
} from '../interfaces/user-service.interface';
import { JwtPayload } from '../../registration/jwt-payload';
import { CreateUsersRequestDTO } from '../dtos/presentations/create-users.request';
import { PaymentService } from '../../../monthly-money/internal/payment.service';
import { CreatePaymentRequest } from '../dtos/presentations/create-payment.request';
import { UpgradeUserMemberRequest } from '../dtos/presentations/upgrade-user-member.request';
import { UserProbationRequest } from '../dtos/presentations/get-users-probation.request';
import { UpdateUserRequest } from '../dtos/presentations/update-user.request';
import { Identified } from '../../registration/identified.decorator';
import { OffsetPaginationResponse } from '../../../system/pagination';
import { UploadUserFileValidatorPipe } from '../upload-user-file.pipe';
import { UpdateMyProfileRequest } from '../dtos/presentations/update-my-profile.request';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {}

  @Identified
  @Get('/me')
  @ApiOkResponse()
  findMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findMyProfile(user.sub);
  }

  @CanAccessBy(Permissions.READ_USERS, Permissions.WRITE_USERS)
  @Get('/:id')
  findUserDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.userService.findUserDetail(userId);
  }

  @CanAccessBy(
    Permissions.READ_USERS,
    Permissions.WRITE_USERS,
    Permissions.READ_ACTIVITY_LOGS,
  )
  @Get('/')
  @ApiOkResponse()
  async findUsers(
    @Query() query: GetUsersQueryRequest,
  ): Promise<OffsetPaginationResponse<UserManagementViewDTO>> {
    return this.userService.findUsers(query);
  }

  @CanAccessBy(Permissions.WRITE_USERS)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  /**
   * @deprecated API Design is not correctly implemented, should return Role model instead of User
   */
  @CanAccessBy(Permissions.EDIT_IAM)
  @Get('/:id/roles')
  @ApiOkResponse()
  findUserWithRoles(@Param('id') userId: string) {
    return this.userService.findOne({
      id: userId,
      withRoles: true,
    });
  }

  @CanAccessBy(Permissions.WRITE_USERS)
  @Patch('/:id')
  @ApiNoContentResponse()
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRequest,
  ) {
    await this.userService.updateUser({
      ...dto,
      id: userId,
    });
  }

  @Identified
  @Patch('/me')
  @ApiNoContentResponse()
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMyProfileRequest,
  ) {
    await this.userService.updateMyProfile({
      ...dto,
      id: userId,
    });
  }

  @CanAccessBy(Permissions.EDIT_IAM)
  @Patch('/:id/roles')
  @ApiNoContentResponse()
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    await this.userService.updateUserRoles(userId, dto);
  }

  @CanAccessBy(Permissions.WRITE_USERS)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersRequestDTO) {
    await this.userService.createUser(createUsersDto);
  }

  @CanAccessBy(Permissions.WRITE_USERS)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  createUsersByFile(
    @Body() dto: FileCreateUsersDto,
    @UploadedFile(new UploadUserFileValidatorPipe())
    file: Express.Multer.File,
  ) {
    return this.userService.createUsersByFile({ ...dto, file });
  }

  @CanAccessBy(Permissions.WRITE_PAYMENTS)
  @Post('/:userId/payments')
  async createUserPayment(
    @Body() createPaymentDto: CreatePaymentRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.userService.createUserPayment(userId, createPaymentDto);
  }

  @CanAccessBy(Permissions.READ_PAYMENTS)
  @Get('/:userId/payments')
  async findUserPayments(@Param('userId') userId: string) {
    return this.paymentService.findUserPaymentsByUserId(userId);
  }

  @CanAccessBy(Permissions.READ_USERS)
  @Get('/probation')
  findProbationUsers(@Query() userProbationRequest: UserProbationRequest) {
    return this.userService.findProbationUsers(userProbationRequest);
  }

  @CanAccessBy(Permissions.WRITE_USERS)
  @Patch('/members')
  upgradeToMembers(
    @Body() upgradeUserMemberInputDto: UpgradeUserMemberRequest,
  ) {
    return this.userService.upgradeToMembers(upgradeUserMemberInputDto);
  }
}
