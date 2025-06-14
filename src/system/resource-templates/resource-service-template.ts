import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { OffsetPaginationResponse } from '../pagination';
import { DataSource, Repository } from 'typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { OffsetPaginationRequest } from '../pagination/offset-pagination-request';

class ResourceQuery extends OffsetPaginationRequest {}

export interface ResourceCRUDService<E extends ObjectLiteral> {
  find(): Promise<OffsetPaginationResponse<E>>;
  find(query: OffsetPaginationRequest): Promise<OffsetPaginationResponse<E>>;
  createOne<DTO>(dto: DTO): Promise<void>;
  createMany<DTO>(dto: DTO[]): Promise<void>;
  upsertMany<DTO>(dto: DTO[]): Promise<void>;
}

export class ResourceCRUDServiceImpl<E> implements ResourceCRUDService<E> {
  constructor(private readonly repository: Repository<E>) {}

  async upsertMany<DTO>(dto: DTO[]): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .values(dto as unknown as QueryDeepPartialEntity<E>)
      .orIgnore('ON CONFLICT')
      .execute();
  }

  find(): Promise<OffsetPaginationResponse<E>>;
  find(query: ResourceQuery): Promise<OffsetPaginationResponse<E>>;
  async find(query?: ResourceQuery): Promise<OffsetPaginationResponse<E>> {
    if (!query) {
      const entities = await this.repository.find();

      return OffsetPaginationResponse.of({
        items: entities,
        totalRecords: entities.length,
        query: { page: 1, size: Infinity },
      });
    }

    const [items, totalRecords] = await this.repository.findAndCount({
      skip: OffsetPaginationRequest.getOffset(query.page, query.size),
      take: query.size,
    });

    return OffsetPaginationResponse.of({
      items,
      totalRecords,
      query,
    });
  }

  async createOne<DTO>(dto: DTO): Promise<void> {
    await this.repository.insert(dto as unknown as QueryDeepPartialEntity<E>);
  }

  async createMany<DTO>(dto: DTO[]): Promise<void> {
    await this.repository.insert(dto as unknown as QueryDeepPartialEntity<E>);
  }
}

export const createCRUDService = <Entity extends ObjectType<Entity>>(
  entity: Entity,
) => {
  const token = `${entity.name}ResourceCRUDService`;

  return {
    token: token,
    createProvider: () => {
      return {
        provide: token,
        useFactory: (dataSource: DataSource) => {
          const repository = dataSource.getRepository<Entity>(entity);

          return new ResourceCRUDServiceImpl(repository);
        },
        inject: [DataSource],
      };
    },
  };
};
