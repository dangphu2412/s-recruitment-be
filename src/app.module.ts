import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/internal/user.module';
import { AuthModule } from './authentication/internal/auth.module';
import { AuthorizationModule } from './authorization/internal/authorization.module';
import { SharedModule } from './shared/shared.module';
import { MenuModule } from './menu/internal/menu.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';
import { RecruitmentEventModule } from './recruitment/internal/recruitment-event.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    AuthorizationModule,
    SharedModule,
    MenuModule,
    MonthlyMoneyModule,
    RecruitmentEventModule,
  ],
})
export class AppModule {}
