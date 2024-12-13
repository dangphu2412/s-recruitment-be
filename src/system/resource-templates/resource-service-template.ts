import { Injectable } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { OffsetPagination, Page, PageRequest } from '../query-shape/dto';
import { DataSource, Repository } from 'typeorm';
import { ObjectType } from 'typeorm/common/ObjectType';

type ResourceQuery = OffsetPagination;

export interface ResourceService<E extends ObjectLiteral> {
  findAll(): Promise<E[]>;
  findPaginated(query: ResourceQuery): Promise<Page<E>>;
}

@Injectable()
export class ResourceServiceImpl<E> implements ResourceService<E> {
  constructor(private readonly repository: Repository<E>) {}

  findAll() {
    return this.repository.find();
  }

  async findPaginated(query: ResourceQuery) {
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
}

export const createResourceService = <Entity extends ObjectType<Entity>>(
  entity: Entity,
) => {
  const token = `${entity.name}ResourceService`;

  return {
    token: token,
    createProvider: () => {
      return {
        provide: token,
        useFactory: (dataSource: DataSource) => {
          const repository = dataSource.getRepository<Entity>(entity);

          return new ResourceServiceImpl(repository);
        },
        inject: [DataSource],
      };
    },
  };
};
