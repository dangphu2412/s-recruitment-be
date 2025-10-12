import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddUserColumnLeaveDate1759741434955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'leave_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'leave_reason',
        type: 'varchar',
        isNullable: true,
        default: null,
      }),
    ]);

    // New id reference 1-1 to users, but temporary let it null to backfill step
    await queryRunner.addColumns('operation_fees', [
      new TableColumn({
        name: 'id_v2',
        type: 'uuid',
        isNullable: true,
        default: null,
      }),
    ]);
    // Backfill the user id to new id
    await queryRunner.manager.query(`
      UPDATE operation_fees SET id_v2 = users.id
      FROM users
      WHERE users.operation_fee_id = operation_fees.id;
    `);

    // Temporary keep old ID for backup situation
    await queryRunner.renameColumn('operation_fees', 'id', 'deprecated_id');
    await queryRunner.renameColumn('operation_fees', 'id_v2', 'id');

    /**
     * START Update constraints
     */
    await queryRunner.dropForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['operation_fee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'operation_fees',
      }),
    );
    await queryRunner.dropPrimaryKey('operation_fees');
    /**
     * END Update constraints
     */

    await queryRunner.changeColumn(
      'operation_fees',
      new TableColumn({
        name: 'id',
        type: 'uuid',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'id',
        type: 'uuid',
        primaryKeyConstraintName: 'PK_operation_fees_user_id',
        isPrimary: true,
        isNullable: false,
      }),
    );
    await queryRunner.dropColumn('users', 'operation_fee_id');
  }

  public down(): Promise<void> {
    return;
  }
}
