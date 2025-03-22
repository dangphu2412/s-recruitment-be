import { Module } from '@nestjs/common';
import { DatabaseModule } from './system/database/database.module';
import { AccountServiceModule } from './account-service/account-service.module';
import { SystemModule } from './system/system.module';
import { MenuModule } from './menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { RecruitmentEventModule } from './recruitment/recruitment-event.module';
import { PostsServiceModule } from './posts-service/posts-service.module';
import { FileServiceModule } from './file-service/file-service.module';
import { ActivityModule } from './activities/activity.module';
import { MasterDataServiceModule } from './master-data-service/master-data-service.module';

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
    ActivityModule,
    MasterDataServiceModule,
  ],
})
export class AppModule {}
