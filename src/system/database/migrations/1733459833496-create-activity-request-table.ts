import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateActivityRequestTable1733459833496
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mdm_time_of_days',
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
            name: 'from_time',
            type: 'time without time zone',
            isNullable: false,
          },
          {
            name: 'to_time',
            type: 'time without time zone',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'mdm_day_of_weeks',
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
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'activity_requests',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'request_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'reject_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'revise_note',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'time_of_day_id',
            type: 'varchar',
          },
          {
            name: 'day_of_week_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'compensatory_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'request_change_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approval_status',
            type: 'varchar',
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('activity_requests', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['time_of_day_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_time_of_days',
      }),
      new TableForeignKey({
        columnNames: ['day_of_week_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_day_of_weeks',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'activities',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'request_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'time_of_day_id',
            type: 'varchar',
          },
          {
            name: 'day_of_week_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'compensatory_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'request_change_day',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('activities', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['time_of_day_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_time_of_days',
      }),
      new TableForeignKey({
        columnNames: ['day_of_week_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'mdm_day_of_weeks',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'activity_logs',
        columns: [
          {
            name: 'from_time',
            type: 'timestamp',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'to_time',
            type: 'timestamp',
            isNullable: false,
            isPrimary: true,
          },
          {
            name: 'work_status',
            type: 'varchar',
          },
          {
            name: 'track_id',
            type: 'varchar',
            isNullable: false,
            isPrimary: true,
          },
        ],
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
