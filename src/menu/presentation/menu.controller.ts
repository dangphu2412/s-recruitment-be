import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../account-service/management/user.decorator';
import { Identified } from '../../account-service/registration/identified.decorator';
import { MenuService } from '../domain/services/menu.service.interface';

@Controller({
  path: 'menus',
  version: '1',
})
@ApiTags('menus')
export class MenuController {
  constructor(
    @Inject(MenuService)
    private readonly menuService: MenuService,
  ) {}

  @Identified
  @Get()
  findMenusByUserId(@CurrentUserId userId: string) {
    return this.menuService.findMenusByUserId(userId);
  }
}
