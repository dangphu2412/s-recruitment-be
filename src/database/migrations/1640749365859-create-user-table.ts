import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateUserTable1640749365859 implements MigrationInterface {
  private UNIQUE_USERNAME_KEY = 'UQ_users_username_key';
  private UNIQUE_EMAIL_KEY = 'UQ_users_email_key';
  private INDEX_USERNAME_KEY = 'IDX_users_username_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'joined_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'birthday',
            type: 'timestamp',
            isNullable: true,
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createUniqueConstraints('users', [
      new TableUnique({
        name: this.UNIQUE_USERNAME_KEY,
        columnNames: ['username'],
      }),
      new TableUnique({
        name: this.UNIQUE_EMAIL_KEY,
        columnNames: ['email'],
      }),
    ]);

    await queryRunner.createIndices('users', [
      new TableIndex({
        name: this.INDEX_USERNAME_KEY,
        columnNames: ['username'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraints('users', [
      new TableUnique({
        name: this.UNIQUE_USERNAME_KEY,
        columnNames: ['username'],
      }),
      new TableUnique({
        name: this.UNIQUE_EMAIL_KEY,
        columnNames: ['email'],
      }),
    ]);

    await queryRunner.dropIndices('users', [
      new TableIndex({
        name: this.INDEX_USERNAME_KEY,
        columnNames: ['username'],
      }),
    ]);

    await queryRunner.dropTable('users');
  }
}
