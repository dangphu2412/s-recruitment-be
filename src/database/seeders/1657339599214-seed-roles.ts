import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Role } from '../../authorization';

export class SeedRoles1657339599214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    await roleRepository.insert([
      {
        name: 'Admin',
        key: 'ADMIN',
        description: '',
      },
      {
        name: 'Member',
        key: 'MEMBER',
        description: '',
      },
      {
        name: 'Newbie',
        key: 'NEWBIE',
        description: '',
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    await roleRepository.delete({
      key: In(['ADMIN', 'MEMBER', 'NEWBIE']),
    });
  }
}
