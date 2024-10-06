import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateMasterData1728103444636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mdm_common',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code',
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
        name: 'domain_id',
        type: 'int',
        isNullable: true,
      }),
      new TableColumn({
        name: 'period_id',
        type: 'int',
        isNullable: true,
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
