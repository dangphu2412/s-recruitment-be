import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuService, MenuServiceToken } from '../client';
import {
  CurrentUser,
  Identified,
} from '../../../account-service/adapters/decorators';
import { JwtPayload } from '../../../account-service/domain/dtos/jwt-payload';

@Controller({
  path: 'menus',
  version: '1',
})
@ApiTags('menus')
export class MenuController {
  constructor(
    @Inject(MenuServiceToken)
    private readonly menuService: MenuService,
  ) {}

  @Identified
  @Get()
  findMenusByUserId(@CurrentUser() { sub: userId }: JwtPayload) {
    return this.menuService.findMenusByUserId(userId);
  }
}
