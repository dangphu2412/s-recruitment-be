import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreateRoleAndPermission1650749408883
  implements MigrationInterface
{
  private UNIQUE_NAME_KEY = 'UQ_roles_name_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'update_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'is_editable',
            type: 'boolean',
            default: true,
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('roles', [
      new TableUnique({
        name: this.UNIQUE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraints('roles', [
      new TableUnique({
        name: this.UNIQUE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);

    await queryRunner.dropTable('roles');
  }
}
