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
import { AccessRights } from '../domain/constants/role-def.enum';
import { UserManagementQueryDto } from '../domain/dtos/user-management-query.dto';
import { UserManagementView } from '../domain/vos/user-management-view.vo';
import {
  UserService,
  UserServiceToken,
} from '../domain/interfaces/user-service';
import { JwtPayload } from '../domain/dtos/jwt-payload';
import { CreateUsersDto } from '../domain/dtos/create-users.dto';
import { PaymentService } from '../../monthly-money/internal/payment.service';
import { CreatePaymentDto } from '../domain/dtos/create-payment.dto';
import { UserProbationQueryInputDto } from '../domain/inputs/user-probation-query.input';
import { UpgradeUserMemberInputDto } from '../domain/inputs/upgrade-user-member.input';

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

  @CanAccessBy(AccessRights.VIEW_USERS, AccessRights.EDIT_MEMBER_USER)
  @Get('/:id')
  findUserDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.domainUser.findUserDetail(userId);
  }

  @CanAccessBy(AccessRights.VIEW_USERS, AccessRights.EDIT_MEMBER_USER)
  @Get('/')
  @ApiOkResponse()
  async searchOverviewUsers(
    @Query() query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    return this.domainUser.searchOverviewUsers(query);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.domainUser.toggleUserIsActive(id);
  }

  @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Get('/:id/roles')
  @ApiOkResponse()
  findUserWithRoles(@Param('id') userId: string) {
    return this.domainUser.findOne({
      id: userId,
      withRoles: true,
    });
  }

  @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Patch('/:id/roles')
  @ApiNoContentResponse()
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    await this.domainUser.updateUserRoles(userId, dto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.domainUser.createUserUseCase(createUsersDto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiNoContentResponse()
  createUsersByFile(
    @Body() dto: FileCreateUsersDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.domainUser.createUsersByFile({ ...dto, file });
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post('/:userId/payments')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    await this.domainUser.isIdExist(userId);
    await this.paymentService.createPayment({ ...createPaymentDto, userId });
  }

  @CanAccessBy(AccessRights.VIEW_USERS)
  @Get('/:userId/payments')
  async findUserPayments(@Param('userId') userId: string) {
    return this.paymentService.findUserPaymentsByUserId(userId);
  }

  @CanAccessBy(AccessRights.VIEW_USERS)
  @Get('/probation')
  findProbationUsers(
    @Query() userProbationQueryInputDto: UserProbationQueryInputDto,
  ) {
    return this.domainUser.findProbationUsers(userProbationQueryInputDto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Patch('/members')
  upgradeToMembers(
    @Body() upgradeUserMemberInputDto: UpgradeUserMemberInputDto,
  ) {
    return this.domainUser.upgradeToMembers(upgradeUserMemberInputDto);
  }
}
