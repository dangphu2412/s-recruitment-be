import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuService, MenuServiceToken } from '../client';
import { CurrentUser } from '../../account-service/management/user.decorator';
import { JwtPayload } from '../../account-service/registration/jwt-payload';
import { Identified } from '../../account-service/registration/identified.decorator';

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
