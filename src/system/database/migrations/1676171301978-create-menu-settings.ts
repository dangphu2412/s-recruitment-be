import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateMenuSettings1676171301978 implements MigrationInterface {
  private INDEX_MENU_KEY = 'IDX_FK_menus_settings_menus_key';
  private INDEX_PERMISSION_KEY = 'IDX_FK_menus_settings_permissions_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'menu_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'permission_id',
            type: 'int',
          },
          {
            name: 'menu_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('menu_settings', [
      new TableForeignKey({
        columnNames: ['menu_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menus',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('menu_settings', [
      new TableIndex({
        name: this.INDEX_PERMISSION_KEY,
        columnNames: ['permission_id'],
      }),
      new TableIndex({
        name: this.INDEX_MENU_KEY,
        columnNames: ['menu_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('menu_settings', [
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['menu_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menus',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.dropIndices('menu_settings', [
      new TableIndex({
        name: this.INDEX_PERMISSION_KEY,
        columnNames: ['permission_id'],
      }),
      new TableIndex({
        name: this.INDEX_MENU_KEY,
        columnNames: ['menu_id'],
      }),
    ]);

    await queryRunner.dropTable('menu_settings');
  }
}
