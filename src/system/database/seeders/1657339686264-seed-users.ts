import { MigrationInterface, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SystemRoles, Role } from '../../../account-service/authorization';
import { User } from '../../../account-service/user';
import { DigestService, EnvironmentKeyFactory } from '../../services';

export class SeedUsers1657339686264 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    const roleRepository = queryRunner.manager.getRepository(Role);

    const adminRole = await roleRepository.findOne({
      where: {
        name: SystemRoles.CHAIRMAN,
      },
    });
    const digestService = new DigestService(
      new EnvironmentKeyFactory(
        new ConfigService<Record<string, unknown>, false>(),
      ),
    );
    const password = await digestService.hash('test123');
    const user = new User();
    user.fullName = 'Phu Dep Trai';
    user.email = 'test@gmail.com';
    user.username = 'test';
    user.password = password;
    user.roles = [adminRole];
    await userRepository.save(user);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    await userRepository.delete({
      username: 'test',
    });
  }
}
