import { Module } from '@nestjs/common';
import { DatabaseModule } from './system/database/database.module';
import { AccountServiceModule } from './account-service';
import { SystemModule } from './system/system.module';
import { MenuModule } from './system/menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { RecruitmentEventModule } from './recruitment/infrastructure/recruitment-event.module';
import { PostsServiceModule } from './posts-service/infrastructure';
import { FileServiceModule } from './file-service/infrastructure/file-service.module';

@Module({
  imports: [
    DatabaseModule,
    AccountServiceModule,
    SystemModule,
    MenuModule,
    MonthlyMoneyModule,
    RecruitmentEventModule,
    PostsServiceModule,
    FileServiceModule,
  ],
})
export class AppModule {}
