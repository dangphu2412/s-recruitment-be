import { Module } from '@nestjs/common';
import { DatabaseModule } from './system/database/database.module';
import { UserModule } from './account-service/user/internal/user.module';
import { AuthModule } from './account-service/authentication/internal/auth.module';
import { AuthorizationModule } from './account-service/authorization/internal/authorization.module';
import { SystemModule } from './system/system.module';
import { MenuModule } from './menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { RecruitmentEventModule } from './recruitment/internal/recruitment-event.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    AuthorizationModule,
    SystemModule,
    MenuModule,
    MonthlyMoneyModule,
    RecruitmentEventModule,
  ],
})
export class AppModule {}
