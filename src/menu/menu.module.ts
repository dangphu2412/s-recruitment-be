import { Module } from '@nestjs/common';
import { MenuController } from './presentation/menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuServiceImpl } from './use-cases/menu.service';
import { AccountServiceModule } from '../account-service/account-service.module';
import { Menu } from '../system/database/entities/menu.entity';
import { MenuRepository } from './domain/repositories/menu.repository.interface';
import { MenuRepositoryImpl } from './infras/menu.repository';
import { MenuService } from './domain/services/menu.service.interface';

@Module({
  imports: [AccountServiceModule, TypeOrmModule.forFeature([Menu])],
  controllers: [MenuController],
  providers: [
    {
      provide: MenuService,
      useClass: MenuServiceImpl,
    },
    {
      provide: MenuRepository,
      useClass: MenuRepositoryImpl,
    },
  ],
})
export class MenuModule {}
