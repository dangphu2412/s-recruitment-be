import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { SystemRoles } from '../../../account-service/authorization/access-definition.constant';

export class AddAssigneeAndApprovedByActivityRequests1758259197973
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('activity_requests', [
      new TableColumn({
        name: 'assignee_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'approver_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('activity_requests', [
      new TableForeignKey({
        columnNames: ['assignee_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
      new TableForeignKey({
        columnNames: ['approver_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
      }),
    ]);

    await queryRunner.manager.query(`
      WITH system_admin AS (
        SELECT u.id
        FROM users u
               JOIN users_roles ur ON ur.user_id = u.id
               JOIN roles r ON ur.role_id = r.id
        WHERE r.name = '${SystemRoles.SUPER_ADMIN}'
        LIMIT 1
        )
      UPDATE activity_requests ar
      SET assignee_id = sa.id,
          approver_id = sa.id
        FROM system_admin sa;`);
  }

  public async down(): Promise<void> {
    return;
  }
}
