import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { TableForeignKey } from 'typeorm/schema-builder/table/TableForeignKey';

export class CreateMasterData1728103444636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mdm_departments',
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
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mdm_periods',
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
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'department_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'period_id',
        type: 'varchar',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_department_id',
        columnNames: ['department_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_departments',
      }),
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'FK_users_period_id',
        columnNames: ['period_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_periods',
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
