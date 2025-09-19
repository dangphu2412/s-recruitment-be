import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { UpdateRoleRequestDto } from '../dtos/presentation/update-role-request.dto';
import { RoleService } from '../interfaces/role-service.interface';
import { CanAccessBy } from '../can-access-by.decorator';
import { Permissions } from '../access-definition.constant';
import { CreateRoleRequestDTO } from '../dtos/presentation/create-role-request.dto';
import { UpdateAssignedPersonsRequestDTO } from '../dtos/presentation/update-assigned-persons.request';
import { GetAccessControlRequestDTO } from '../dtos/presentation/get-access-control.request';
import { AccessControlView } from '../dtos/core/role-list.dto';
import { Identified } from '../../account-service.package';
import { CurrentUser } from '../../management/user.decorator';

@ApiTags('roles')
@Controller({
  version: '1',
  path: '/roles',
})
export class RoleController {
  constructor(
    @Inject(RoleService)
    private readonly roleService: RoleService,
  ) {}

  @CanAccessBy(Permissions.READ_IAM)
  @Get()
  getRoles(
    @Query() query: GetAccessControlRequestDTO,
  ): Promise<AccessControlView> {
    return this.roleService.findAccessControlView(query);
  }

  @Identified
  @Get('/me')
  getMyRoles(@CurrentUser('sub') userId: string) {
    return this.roleService.findMyRoles(userId);
  }

  @CanAccessBy(Permissions.EDIT_IAM)
  @Put('/:id')
  @ApiNoContentResponse()
  async updateRole(
    @Param('id') roleId: number,
    @Body() updateRoleDto: UpdateRoleRequestDto,
  ) {
    await this.roleService.updateRole(roleId, updateRoleDto);
  }

  @CanAccessBy(Permissions.EDIT_IAM)
  @Put('/:id/users')
  @ApiNoContentResponse()
  async updateAssignedPersonsToRole(
    @Param('id') roleId: number,
    @Body() updateAssignedPersonsRequestDTO: UpdateAssignedPersonsRequestDTO,
  ) {
    await this.roleService.updateAssignedPersonsToRole(
      roleId,
      updateAssignedPersonsRequestDTO,
    );
  }

  @CanAccessBy(Permissions.EDIT_IAM)
  @Post()
  @ApiNoContentResponse()
  async createRole(@Body() createRoleRequestDTO: CreateRoleRequestDTO) {
    await this.roleService.createRole(createRoleRequestDTO);
  }
}
