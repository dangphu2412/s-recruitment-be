import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreateOperationFeeTable1667380184103
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'operation_fees',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'paid_money',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'remain_months',
            type: 'int',
            default: 0,
          },
          {
            name: 'paid_months',
            type: 'int',
            default: 0,
          },
          {
            name: 'temporary_leave_start',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'estimated_return_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'monthly_config_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'operation_fee_id',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('operation_fees', [
      new TableForeignKey({
        columnNames: ['monthly_config_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'monthly_money_configs',
      }),
    ]);

    await queryRunner.createForeignKeys('users', [
      new TableForeignKey({
        columnNames: ['operation_fee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'operation_fees',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('operation_fees', [
      new TableForeignKey({
        columnNames: ['monthly_config_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'monthly_money_configs',
      }),
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.dropTable('operation_fees');
  }
}
