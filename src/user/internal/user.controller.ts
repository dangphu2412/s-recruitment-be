import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { CurrentUser, Identified, JwtPayload } from '../../authentication';
import {
  AccessRights,
  CanAccessBy,
  RoleService,
  RoleServiceToken,
} from '../../authorization';
import {
  CreateUsersDto,
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
import { FileInterceptor } from '../../core/internal';
import { FileCreateUsersDto } from '../client/dtos/file-create-users.dto';
import { UpdatableUserDto } from '../client/dtos/updatable-user.dto';

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
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  @Identified
  @Get('/me')
  @ApiOkResponse()
  findMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findMyProfile(user.sub);
  }

  @CanAccessBy(AccessRights.VIEW_USERS, AccessRights.EDIT_MEMBER_USER)
  @Get('/')
  @ApiOkResponse()
  async search(
    @Query() query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    return this.userService.search(query);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Get('/:id/roles')
  @ApiOkResponse()
  async findUserRoles(@Param('id') userId: string) {
    // Provide search with deleted
    const user = await this.userService.findById(userId, ['roles']);

    if (!user) {
      return {};
    }

    return user;
  }

  @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Patch('/:id/roles')
  @ApiNoContentResponse()
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() dto: UpdatableUserDto,
  ) {
    await this.userService.update(userId, dto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.userService.createUserUseCase(createUsersDto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
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
    return this.userService.createUserUseCase({ ...dto, file });
  }
}
