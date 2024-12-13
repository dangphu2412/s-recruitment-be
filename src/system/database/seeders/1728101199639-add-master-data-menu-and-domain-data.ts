import { MigrationInterface, QueryRunner } from 'typeorm';
import { Department } from '../../../account-service/domain/data-access/entities/department.entity';
import { Period } from '../../../account-service/domain/data-access/entities/period.entity';

export class AddMasterDataMenu1728101199639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const departmentRepository = queryRunner.manager.getRepository(Department);
    const periodRepository = queryRunner.manager.getRepository(Period);

    await departmentRepository.insert([
      {
        id: 'IT',
        name: 'IT',
        description: 'Information Technology',
      },
      {
        id: 'DS',
        name: 'Design',
        description: 'Design',
      },
      {
        id: 'MO',
        name: 'Marketing Online',
        description: 'Marketing Online',
      },
    ]);

    await periodRepository.insert([
      {
        id: 'LT2022',
        name: 'Khoá Lập Trình 2022',
        description: 'Khoá Lập Trình 2022',
      },
      {
        id: 'LT2023',
        name: 'Khoá Lập Trình 2023',
        description: 'Khoá Lập Trình 2023',
      },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
