import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';
import { ProvinceType } from '../../location/client/constants';

export class CreateProvinceTable1667016972234 implements MigrationInterface {
  private TREE_FOREIGN_KEY = 'FK_province_tree_key';
  private UNIQUE_CODE_KEY = 'UQ_province_code_key';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'provinces',
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
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            isNullable: false,
            enum: Object.values(ProvinceType),
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
      'provinces',
      new TableForeignKey({
        name: this.TREE_FOREIGN_KEY,
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'provinces',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'provinces',
      new TableUnique({
        name: this.UNIQUE_CODE_KEY,
        columnNames: ['code'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('provinces', this.TREE_FOREIGN_KEY);
    await queryRunner.dropTable('provinces');
  }
}
