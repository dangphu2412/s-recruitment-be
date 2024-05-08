import { Module } from '@nestjs/common';
import { DatabaseModule } from './system/database/database.module';
import { AccountServiceModule } from './account-service/infrastructure/account-service.module';
import { SystemModule } from './system/system.module';
import { MenuModule } from './system/menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { RecruitmentEventModule } from './recruitment/infrastructure/recruitment-event.module';

@Module({
  imports: [
    DatabaseModule,
    AccountServiceModule,
    SystemModule,
    MenuModule,
    MonthlyMoneyModule,
    RecruitmentEventModule,
  ],
})
export class AppModule {}
