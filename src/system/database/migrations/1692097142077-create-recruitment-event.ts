import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateRecruitmentEvent1692097142077 implements MigrationInterface {
  private UNIQUE_NAME_KEY = 'UQ_recruitment_events_name_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recruitment_events',
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
          },
          {
            name: 'location',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'scoring_standard',
            type: 'json',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'recruitment_events_examiners',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'recruitment_event_id',
            type: 'int',
          },
          {
            name: 'examiner_id',
            type: 'uuid',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('recruitment_events_examiners', [
      new TableForeignKey({
        columnNames: ['recruitment_event_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'recruitment_events',
      }),
      new TableForeignKey({
        columnNames: ['examiner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.createForeignKeys('recruitment_events', [
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.createUniqueConstraints('recruitment_events', [
      new TableUnique({
        name: this.UNIQUE_NAME_KEY,
        columnNames: ['name'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'recruitment_employees',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: 'data',
            type: 'json',
          },
          {
            name: 'event_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('recruitment_employees', [
      new TableForeignKey({
        columnNames: ['event_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'recruitment_events',
      }),
    ]);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
