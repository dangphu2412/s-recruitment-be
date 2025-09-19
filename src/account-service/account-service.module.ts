import { Module } from '@nestjs/common';
import { AuthController } from './registration/controllers/auth.controller';
import { AuthServiceImpl } from './registration/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenGeneratorImpl } from './registration/services/token-factory';
import { PasswordManager } from './registration/services/password-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAuthorizationStrategy } from './authorization/services/role-authorization.strategy';
import { RoleServiceImpl } from './authorization/services/role.service';
import { RoleRepository } from './authorization/repositories/role.repository';
import { RoleController } from './authorization/controllers/role.controller';
import { Permission } from './shared/entities/permission.entity';
import { MonthlyMoneyModule } from '../monthly-money/internal/monthly-money.module';
import { UserController } from './management/controllers/user.controller';
import { UserServiceImpl } from './management/services/user.service';
import { UserRepository } from './management/repositories/user.repository';
import { User } from './shared/entities/user.entity';
import { Role } from './shared/entities/role.entity';
import { RoleService } from './authorization/interfaces/role-service.interface';
import { UserService } from './management/interfaces/user-service.interface';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';
import { AuthService } from './registration/interfaces/auth-service.interface';
import { TokenFactory } from './registration/interfaces/token-factory.interface';
import { PermissionServiceImpl } from './authorization/services/permission.service';
import { PermissionService } from './authorization/interfaces/permission-service.interface';
import { PermissionController } from './authorization/controllers/permissions.controller';
import { SALT_ROUNDS } from './registration/interfaces/password-manager.interface';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './registration/services/jwt.strategy';
import { MoneyReminderJob } from './management/jobs/money-reminder.job';
import { MailModule } from '../system/mail/mail.module';
import { FeatureFlagsModule } from '../system/feature-flags/feature-flags.module';
import { UserReminderController } from './management/controllers/user-reminder.controller';
import { MessageQueueModule } from '../system/message-queue/message-queue.module';
import { SendMoneyReminderConsumer } from './management/jobs/send-money-reminder.consumer';

@Module({
  imports: [
    MonthlyMoneyModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MasterDataServiceModule,
    MailModule,
    FeatureFlagsModule,
    MessageQueueModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [
    AuthController,
    RoleController,
    UserController,
    UserReminderController,
    PermissionController,
  ],
  providers: [
    JwtStrategy,
    PasswordManager,
    RoleAuthorizationStrategy,
    RoleRepository,
    UserRepository,
    MoneyReminderJob,
    SendMoneyReminderConsumer,
    {
      provide: AuthService,
      useClass: AuthServiceImpl,
    },
    {
      provide: TokenFactory,
      useClass: TokenGeneratorImpl,
    },
    {
      provide: RoleService,
      useClass: RoleServiceImpl,
    },
    {
      provide: PermissionService,
      useClass: PermissionServiceImpl,
    },
    {
      provide: UserService,
      useClass: UserServiceImpl,
    },
    {
      provide: SALT_ROUNDS,
      useFactory: (configService: ConfigService) => {
        return +configService.get('SALT_ROUNDS');
      },
      inject: [ConfigService],
    },
  ],
  exports: [PasswordManager, UserService, RoleService],
})
export class AccountServiceModule {}
