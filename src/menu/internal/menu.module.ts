import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuServiceImpl } from './menu.service';
import { MenuServiceToken } from '../client';
import { MenuRepository } from './menu.repositoryt';
import { AccountServiceModule } from '../../account-service/account-service.module';
import { Menu } from '../../system/database/entities/menu.entity';

@Module({
  imports: [AccountServiceModule, TypeOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [
    {
      provide: MenuServiceToken,
      useClass: MenuServiceImpl,
    },
    MenuRepository,
  ],
})
export class MenuModule {}
