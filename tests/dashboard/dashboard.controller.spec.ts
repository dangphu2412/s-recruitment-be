import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from '../../src/dashboard/dashboard.controller';
import { DashboardService } from '../../src/dashboard/dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            findKPI: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findKPI with correct params', async () => {
    jest.spyOn(service, 'findKPI').mockResolvedValue({
      totalPayment: 0,
      totalPendingRequests: 0,
      totalActiveMembers: 0,
      totalLateMembers: 0,
    });

    expect(await controller.findKPI()).toEqual({
      totalPayment: 0,
      totalPendingRequests: 0,
      totalActiveMembers: 0,
      totalLateMembers: 0,
    });
  });
});
