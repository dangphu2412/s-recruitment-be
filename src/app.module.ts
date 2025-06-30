import { Module } from '@nestjs/common';
import { AccountServiceModule } from './account-service/account-service.module';
import { SystemModule } from './system/system.module';
import { MenuModule } from './menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { ActivityModule } from './activities/activity.module';
import { MasterDataServiceModule } from './master-data-service/master-data-service.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    AccountServiceModule,
    SystemModule,
    MenuModule,
    MonthlyMoneyModule,
    ActivityModule,
    MasterDataServiceModule,
    DashboardModule,
  ],
})
export class AppModule {}
