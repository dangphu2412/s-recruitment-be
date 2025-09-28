import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AdjustLateAbsentAndTrainingModelForActivityRequest1759030282399
  implements MigrationInterface
{
  private readonly INDEX_USER_KEY = 'IDX_FK_attendees_sessions_users_key';
  private readonly INDEX_ACTIVITY_KEY =
    'IDX_FK_attendees_sessions_activities_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('activity_requests', [
      new TableColumn({
        name: 'activity_reference_id',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('activity_requests', [
      new TableForeignKey({
        columnNames: ['activity_reference_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'activities',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'attendees_sessions',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'activity_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('attendees_sessions', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['activity_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'activities',
      }),
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
