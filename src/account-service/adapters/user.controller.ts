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
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from 'src/monthly-money';
import { CurrentUser, Identified } from './decorators';
import { CanAccessBy } from './decorators/can-access-by.decorator';
import { Page } from '../../system/query-shape/types';
import { UpdatableUserDto } from '../domain/dtos/updatable-user.dto';
import { UpdateMemberPaidDto } from '../domain/dtos/update-member-paid.dto';
import { FileInterceptor } from '../../system/file';
import { FileCreateUsersDto } from '../domain/dtos/file-create-users.dto';
import { AccessRights } from '../domain/constants/role-def.enum';
import { UserManagementQueryDto } from '../domain/dtos/user-management-query.dto';
import { UserManagementView } from '../domain/vos/user-management-view.vo';
import { DomainUser, DomainUserToken } from '../domain/interfaces/domain-user';
import { JwtPayload } from '../domain/dtos/jwt-payload';
import { CreateUsersDto } from '../domain/dtos/create-users.dto';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(DomainUserToken)
    private readonly domainUser: DomainUser,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly moneyOperationService: MonthlyMoneyOperationService,
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
  async search(
    @Query() query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    return this.domainUser.search(query);
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
    @Body() dto: UpdatableUserDto,
  ) {
    await this.domainUser.update(userId, dto);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.domainUser.createUserUseCase(createUsersDto);
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
    return this.domainUser.createUserUseCase({ ...dto, file });
  }
}
