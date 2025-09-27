import { Test, TestingModule } from '@nestjs/testing';
import { In } from 'typeorm';
import { ActivityRequestQueryServiceImpl } from '../../../src/activities/requests/use-cases/activity-request-query.service';
import { ActivityRequestRepository } from '../../../src/activities/requests/infras/repositories/activity-request.repository';
import { OffsetPaginationResponse } from '../../../src/system/pagination';

describe('ActivityRequestQueryServiceImpl', () => {
  let service: ActivityRequestQueryServiceImpl;
  let repository: jest.Mocked<ActivityRequestRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityRequestQueryServiceImpl,
        {
          provide: ActivityRequestRepository,
          useValue: {
            findOverviewRequests: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findDetailById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ActivityRequestQueryServiceImpl>(
      ActivityRequestQueryServiceImpl,
    );
    repository = module.get(
      ActivityRequestRepository,
    ) as jest.Mocked<ActivityRequestRepository>;
  });

  describe('search', () => {
    it('should call repository.findOverviewRequests with dto and return result', async () => {
      const dto = { page: 1, size: 10 } as any;
      const expected = { data: ['mocked'] } as any;
      repository.findOverviewRequests.mockResolvedValue(expected);

      const result = await service.search(dto);

      expect(repository.findOverviewRequests).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('searchMy', () => {
    it('should call repository.find with userId only and return paginated response', async () => {
      const dto = { userId: '123' };
      const items = [{ id: 1 }, { id: 2 }] as any;
      repository.find.mockResolvedValue(items);

      const result = await service.searchMy(dto);

      expect(repository.find).toHaveBeenCalledWith({
        where: { authorId: '123' },
        relations: ['author', 'dayOfWeek', 'timeOfDay'],
      });
      expect(result).toEqual(
        OffsetPaginationResponse.of({
          items,
          totalRecords: items.length,
          query: { page: 1, size: 10 },
        }),
      );
    });

    it('should call repository.find with userId and status', async () => {
      const dto = { userId: '123', status: ['APPROVED'] };
      const items = [{ id: 3 }] as any;
      repository.find.mockResolvedValue(items);

      const result = await service.searchMy(dto);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          authorId: '123',
          approvalStatus: In(['APPROVED']),
        },
        relations: ['author', 'dayOfWeek', 'timeOfDay'],
      });
      expect(result.items).toEqual(items);
    });
  });

  describe('findMyById', () => {
    it('should call repository.findOne with id and userId', async () => {
      const id = 42;
      const userId = 'abc';
      const expected = { id, authorId: userId } as any;
      repository.findOne.mockResolvedValue(expected);

      const result = await service.findMyById(id, userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id, authorId: userId },
        relations: ['author', 'dayOfWeek', 'timeOfDay'],
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should call repository.findDetailById with id', async () => {
      const id = 55;
      const expected = { id } as any;
      repository.findDetailById.mockResolvedValue(expected);

      const result = await service.findById(id);

      expect(repository.findDetailById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });
});
