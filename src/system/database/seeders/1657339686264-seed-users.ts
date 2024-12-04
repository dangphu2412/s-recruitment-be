import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EnvironmentKeyFactory } from '../../services';
import { PasswordManager } from '../../../account-service/app/password-manager';
import { User } from '../../../account-service/domain/data-access/entities/user.entity';
import { Role } from '../../../account-service/domain/data-access/entities/role.entity';
import { SystemRoles } from '../../../account-service/domain/constants/role-def.enum';

export class SeedUsers1657339686264 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    const roleRepository = queryRunner.manager.getRepository(Role);

    const adminRole = await roleRepository.findOne({
      where: {
        name: SystemRoles.SUPER_ADMIN,
      },
    });
    const passwordManager = new PasswordManager(
      new EnvironmentKeyFactory(
        new ConfigService<Record<string, unknown>, false>(),
      ),
    );
    const password = await passwordManager.getDefaultPassword();
    const user = new User();
    user.fullName = 'Phu Dep Trai';
    user.email = 'noibosgroup@gmail.com';
    user.username = 'noibosgroup@gmail.com';
    user.password = password;
    user.roles = [adminRole];
    user.period = null;
    user.department = null;
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    await userRepository.delete({
      username: 'noibosgroup@gmail.com',
    });
  }
}
