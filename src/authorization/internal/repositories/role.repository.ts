import { FindOptionsUtils, Repository } from 'typeorm';
import { AccessControlList, Role } from '../../client';
import { RelationIdLoader } from 'typeorm/query-builder/relation-id/RelationIdLoader';
import { RelationIdMetadataToAttributeTransformer } from 'typeorm/query-builder/relation-id/RelationIdMetadataToAttributeTransformer';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';
import { RelationCountLoader } from 'typeorm/query-builder/relation-count/RelationCountLoader';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findAccessControlList(): Promise<AccessControlList> {
    const data = await this.query(`
       SELECT "Role"."id" AS "Role_id", "Role"."name" AS "Role_name", "Role"."description" AS "Role_description", "Role"."updated_at" AS "Role_updated_at", "Role"."is_editable" AS "Role_is_editable", "Role"."update_by_user_id" AS "Role_update_by_user_id", "Role__permissions"."id" AS "Role__permissions_id", "Role__permissions"."name" AS "Role__permissions_name", "Role__permissions"."description" AS "Role__permissions_description" 
       FROM "roles" "Role" 
       LEFT JOIN "roles_permissions" "Role_Role__permissions" ON "Role_Role__permissions"."role_id"="Role"."id"
       LEFT JOIN "permissions" "Role__permissions" ON "Role__permissions"."id"="Role_Role__permissions"."permission_id"
    `);

    const qb = this.createQueryBuilder();

    FindOptionsUtils.applyOptionsToTreeQueryBuilder(qb, {
      relations: ['permissions'],
    });

    const { expressionMap } = qb;

    const relationIdLoader = new RelationIdLoader(
      this.manager.connection,
      this.queryRunner,
      expressionMap.relationIdAttributes,
    );
    const countLoader = new RelationCountLoader(
      this.manager.connection,
      this.queryRunner,
      expressionMap.relationCountAttributes,
    );

    const rawRelationIdResults = await relationIdLoader.load(data);
    const rawRelationCountResults = await countLoader.load(data);

    new RelationIdMetadataToAttributeTransformer(expressionMap).transform();
    const transformer = new RawSqlResultsToEntityTransformer(
      expressionMap,
      this.manager.connection.driver,
      rawRelationIdResults,
      rawRelationCountResults,
      this.queryRunner,
    );
    return transformer.transform(
      data,
      expressionMap.mainAlias,
    ) as AccessControlList;
    // return this.find({
    //   relations: ['permissions'],
    // }) as Promise<AccessControlList>;
  }
}
