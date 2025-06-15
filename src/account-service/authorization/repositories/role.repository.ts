import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from '../../shared/entities/role.entity';
import { AccessControlList } from '../dtos/aggregates/access-control-list.aggregate';
import { GetAccessControlRequestDTO } from '../dtos/presentation/get-access-control.request';
import keyBy from 'lodash/keyBy';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAccessControlList(
    dto: GetAccessControlRequestDTO,
  ): Promise<AccessControlList> {
    const qb = this.createQueryBuilder('roles').leftJoinAndSelect(
      'roles.permissions',
      'permissions',
    );

    if (dto.hasTotalUsers) {
      qb.addSelect('COALESCE(urc.total_users, 0) as "totalUsers"').leftJoin(
        `(SELECT role_id, COUNT(*) AS total_users FROM users_roles GROUP BY role_id)`,
        'urc',
        'roles.id = urc.role_id',
      );
    }

    const { entities, raw } = await qb.getRawAndEntities();

    const idMapToRaw = keyBy(raw, 'roles_id');

    return entities.map((entity) => {
      return {
        ...entity,
        totalUsers: idMapToRaw[entity.id].totalUsers,
      };
    });
  }

  updateAssignedPerson(roleId: number, userIds: string[]) {
    return this.manager.query(
      `INSERT INTO users_roles (user_id, role_id)
        SELECT user_id, $1 AS role_id
        FROM UNNEST($2::uuid[]) AS t(user_id)
        ON CONFLICT DO NOTHING;
    `,
      [roleId, userIds],
    );
  }
}
