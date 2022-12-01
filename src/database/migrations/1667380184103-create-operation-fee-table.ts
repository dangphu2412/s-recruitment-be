import {
  MigrationInterface,
  QueryRunner,
  Table,
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
            name: 'joined_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'monthly_config_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('operation_fees', [
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
