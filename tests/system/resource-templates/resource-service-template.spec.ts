// resource-crud.service.spec.ts
import { Repository } from 'typeorm';
import { ResourceCRUDServiceImpl } from '../../../src/system/resource-templates/resource-service-template';
import { OffsetPaginationResponse } from '../../../src/system/pagination';
import { OffsetPaginationRequest } from '../../../src/system/pagination/offset-pagination-request';

type TestEntity = { id: number; name: string };

describe('ResourceCRUDServiceImpl', () => {
  let repository: jest.Mocked<Repository<TestEntity>>;
  let service: ResourceCRUDServiceImpl<TestEntity>;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findAndCount: jest.fn(),
      insert: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<TestEntity>>;

    service = new ResourceCRUDServiceImpl<TestEntity>(repository);
  });

  describe('find', () => {
    it('should return all entities when no query is provided', async () => {
      // Arrange
      const entities: TestEntity[] = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];
      repository.find.mockResolvedValue(entities);

      // Act
      const result = await service.find();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(
        OffsetPaginationResponse.of({
          items: entities,
          totalRecords: entities.length,
          query: { page: 1, size: Infinity },
        }),
      );
    });

    it('should return paginated entities when query is provided', async () => {
      // Arrange
      const query = new OffsetPaginationRequest();
      query.page = 2;
      query.size = 10;

      const entities: TestEntity[] = [{ id: 3, name: 'C' }];
      repository.findAndCount.mockResolvedValue([entities, 1]);

      // Act
      const result = await service.find(query);

      // Assert
      expect(repository.findAndCount).toHaveBeenCalledWith({
        skip: OffsetPaginationRequest.getOffset(query.page, query.size),
        take: query.size,
      });
      expect(result).toEqual(
        OffsetPaginationResponse.of({
          items: entities,
          totalRecords: 1,
          query,
        }),
      );
    });
  });

  describe('createOne', () => {
    it('should insert a single entity', async () => {
      // Arrange
      const dto = { id: 1, name: 'A' };
      repository.insert.mockResolvedValue({} as any);

      // Act
      await service.createOne(dto);

      // Assert
      expect(repository.insert).toHaveBeenCalledWith(dto);
    });
  });

  describe('createMany', () => {
    it('should insert multiple entities', async () => {
      // Arrange
      const dtos = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ];
      repository.insert.mockResolvedValue({} as any);

      // Act
      await service.createMany(dtos);

      // Assert
      expect(repository.insert).toHaveBeenCalledWith(dtos);
    });
  });

  describe('upsertMany', () => {
    it('should call query builder insert with orIgnore', async () => {
      // Arrange
      const dtos = [{ id: 1, name: 'A' }];

      const executeMock = jest.fn().mockResolvedValue(undefined);
      const orIgnoreMock = jest.fn().mockReturnValue({ execute: executeMock });
      const valuesMock = jest.fn().mockReturnValue({ orIgnore: orIgnoreMock });
      const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
      const qbMock = { insert: insertMock };

      repository.createQueryBuilder.mockReturnValue(qbMock as any);

      // Act
      await service.upsertMany(dtos);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(insertMock).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith(dtos);
      expect(orIgnoreMock).toHaveBeenCalledWith('ON CONFLICT');
      expect(executeMock).toHaveBeenCalled();
    });
  });
});
