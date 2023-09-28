import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuServiceImpl } from './menu.service';
import { Menu, MenuServiceToken } from '../client';
import { UserModule } from '../../../account-service/user/internal/user.module';
import { AuthorizationModule } from 'src/account-service/authorization/internal/authorization.module';
import { MenuRepository } from './menu.repositoryt';

@Module({
  imports: [UserModule, AuthorizationModule, TypeOrmModule.forFeature([Menu])],
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
