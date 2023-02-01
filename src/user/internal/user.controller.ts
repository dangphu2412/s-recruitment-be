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
import { AccessRights, CanAccessBy } from '../../authorization';
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

  @CanAccessBy(AccessRights.VIEW_USERS, AccessRights.EDIT_MEMBER_USER)
  @Get('/')
  @ApiOkResponse()
  async search(
    @Query() query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    return this.searchUserService.search(query);
  }

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
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
