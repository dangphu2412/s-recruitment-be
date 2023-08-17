import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreatePermissionTable1675180023605 implements MigrationInterface {
  private UNIQUE_NAME_KEY = 'UQ_permissions_name_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
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
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('permissions', [
      new TableUnique({
        name: this.UNIQUE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraints('permissions', [
      new TableUnique({
        name: this.UNIQUE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);

    await queryRunner.dropTable('permissions');
  }
}
