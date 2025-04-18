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
import {
  RoleService,
  RoleServiceToken,
} from '../interfaces/role-service.interface';
import { CanAccessBy } from '../can-access-by.decorator';
import { Permissions } from '../access-definition.constant';
import { CreateRoleRequestDTO } from '../dtos/presentation/create-role-request.dto';
import { UpdateAssignedPersonsRequestDTO } from '../dtos/presentation/update-assigned-persons.request';
import { GetAccessControlRequestDTO } from '../dtos/presentation/get-access-control.request';
import { AccessControlView } from '../dtos/core/role-list.dto';

@ApiTags('roles')
@Controller({
  version: '1',
  path: '/roles',
})
export class RoleController {
  constructor(
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  @CanAccessBy(Permissions.VIEW_ACCESS_RIGHTS)
  @Get()
  getRoles(
    @Query() query: GetAccessControlRequestDTO,
  ): Promise<AccessControlView> {
    return this.roleService.findAccessControlView(query);
  }

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
  @Put('/:id')
  @ApiNoContentResponse()
  async updateRole(
    @Param('id') roleId: number,
    @Body() updateRoleDto: UpdateRoleRequestDto,
  ) {
    await this.roleService.updateRole(roleId, updateRoleDto);
  }

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
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

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
  @Post()
  @ApiNoContentResponse()
  async createRole(@Body() createRoleRequestDTO: CreateRoleRequestDTO) {
    await this.roleService.createRole(createRoleRequestDTO);
  }
}
