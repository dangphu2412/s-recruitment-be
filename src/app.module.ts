import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/internal/user.module';
import { AuthModule } from './authentication/internal/auth.module';
import { AuthorizationModule } from './authorization/internal/authorization.module';
import { SharedModule } from './shared/shared.module';
import { MenuModule } from './menu/internal/menu.module';
import { LocationModule } from './location/internal/location.module';
import { MonthlyMoneyModule } from './monthly-money/internal/monthly-money.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    AuthorizationModule,
    SharedModule,
    MenuModule,
    LocationModule,
    MonthlyMoneyModule,
  ],
})
export class AppModule {}
