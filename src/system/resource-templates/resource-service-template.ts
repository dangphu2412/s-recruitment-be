import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { OffsetPagination, Page, PageRequest } from '../query-shape/dto';
import { DataSource, Repository } from 'typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

class ResourceQuery extends OffsetPagination {}

export interface ResourceCRUDService<E extends ObjectLiteral> {
  find(): Promise<Page<E>>;
  find(query: ResourceQuery): Promise<Page<E>>;
  createOne<DTO>(dto: DTO): Promise<void>;
}

export class ResourceCRUDServiceImpl<E> implements ResourceCRUDService<E> {
  constructor(private readonly repository: Repository<E>) {}

  find(): Promise<Page<E>>;
  find(query: ResourceQuery): Promise<Page<E>>;
  async find(query?: ResourceQuery): Promise<Page<E>> {
    if (!query) {
      const entities = await this.repository.find();

      return Page.of({
        items: entities,
        totalRecords: entities.length,
        query: { page: 1, size: Infinity },
      });
    }

    const { offset, size } = PageRequest.of(query);

    const [items, totalRecords] = await this.repository.findAndCount({
      skip: offset,
      take: size,
    });

    return Page.of({
      items,
      totalRecords,
      query,
    });
  }

  async createOne<DTO>(dto: DTO): Promise<void> {
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
