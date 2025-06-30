import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../../src/dashboard/dashboard.service';
import { DataSource } from 'typeorm';

describe('DashboardService', () => {
  let service: DashboardService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call query from datasource', async () => {
    jest.spyOn(dataSource, 'query').mockResolvedValue([
      {
        totalPayment: 0,
        totalPendingRequests: 0,
        totalActiveMembers: 0,
        totalLateMembers: 0,
      },
    ]);

    expect(await service.findKPI()).toEqual({
      totalPayment: 0,
      totalPendingRequests: 0,
      totalActiveMembers: 0,
      totalLateMembers: 0,
    });
  });
});
