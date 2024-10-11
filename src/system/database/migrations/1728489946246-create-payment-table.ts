import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class CreatePaymentTable1728489946246 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'amount',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'paid_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'note',
            type: 'varchar',
            default: "''",
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

    await queryRunner.createForeignKeys('payments', [
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

    await queryRunner.addColumns('operation_fees', [
      new TableColumn({
        name: 'paid_months',
        type: 'int',
        default: 0,
      }),
      new TableColumn({
        name: 'remain_months',
        type: 'int',
        default: 0,
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
