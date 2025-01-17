import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMenu1650750048744 implements MigrationInterface {
  private FK_PARENT_KEY = 'FK_menus_parent_id_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'menus',
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
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'icon_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'access_link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'mpath',
            type: 'varchar',
            default: "''",
            isNullable: false,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'menus',
      new TableForeignKey({
        name: this.FK_PARENT_KEY,
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menus',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('menus', this.FK_PARENT_KEY);
    await queryRunner.dropTable('menus');
  }
}
