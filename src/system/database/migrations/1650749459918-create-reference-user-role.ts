import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateReferenceUserRole1650749459918
  implements MigrationInterface
{
  private INDEX_USER_KEY = 'IDX_FK_users_roles_users_key';
  private INDEX_ROLE_KEY = 'IDX_FK_users_roles_roles_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_roles',
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
            name: 'role_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('users_roles', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('users_roles', [
      new TableIndex({
        name: this.INDEX_USER_KEY,
        columnNames: ['user_id'],
      }),
      new TableIndex({
        name: this.INDEX_ROLE_KEY,
        columnNames: ['role_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('users_roles', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.dropIndices('users_roles', [
      new TableIndex({
        name: this.INDEX_USER_KEY,
        columnNames: ['user_id'],
      }),
      new TableIndex({
        name: this.INDEX_ROLE_KEY,
        columnNames: ['role_id'],
      }),
    ]);

    await queryRunner.dropTable('users_roles');
  }
}
