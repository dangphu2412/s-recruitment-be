import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddPreviewImageColumnAndCategoryColumn1719151064512
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('posts', [
      new TableColumn({
        name: 'preview_image',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'summary',
        type: 'varchar',
        isNullable: false,
        default: `''`,
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'summary',
            type: 'varchar',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'posts_categories',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'post_id',
            type: 'int',
          },
          {
            name: 'category_id',
            type: 'varchar',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('posts_categories', [
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
      }),
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
