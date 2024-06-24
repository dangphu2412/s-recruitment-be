import { MigrationInterface, QueryRunner } from 'typeorm';
import { Category } from '../../../posts-service/domain/entities/category.entity';

export class AddCategories1719151624135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoryRepository = queryRunner.manager.getRepository(Category);

    await categoryRepository.insert([
      {
        id: 'cong-nghe',
        name: 'Công nghệ',
        summary: 'Đây là nơi đăng các nội dung về Công Nghệ',
      },
      {
        id: 'thiet-ke',
        name: 'Thiết Kế',
        summary: 'Đây là nơi đăng các nội dung về Thiết Kế',
      },
      {
        id: 'marketing-online',
        name: 'Marketing Online',
        summary: 'Đây là nơi đăng các nội dung về Marketing Online',
      },
      {
        id: 'noi-bo',
        name: 'Nội bộ',
        summary: 'Đây là nơi đăng các nội dung về nội bộ',
      },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
