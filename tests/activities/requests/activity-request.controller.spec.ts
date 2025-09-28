import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRequestController } from '../../../src/activities/requests/presentation/activity-request.controller';
import { ActivityRequestService } from '../../../src/activities/requests/use-cases/interfaces/activity-request.service';
import { FindRequestedActivityRequestDTO } from '../../../src/activities/requests/presentation/presentation/find-requested-activity-request.dto';
import { JwtPayload } from '../../../src/account-service/registration/jwt-payload';
import { CreateActivityRequestRequest } from '../../../src/activities/requests/presentation/presentation/create-activity-request.request';
import { UpdateMyActivityRequestRequest } from '../../../src/activities/requests/presentation/presentation/update-my-activity.request';
import { UpdateApprovalActivityRequestRequest } from '../../../src/activities/requests/presentation/presentation/update-approval-activity-request.request';
import { FindRequestedActivitiesResponseDTO } from '../../../src/activities/requests/use-cases/dtos/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from '../../../src/activities/requests/use-cases/dtos/find-requested-my-acitivity.dto';
import { ApprovalRequestAction } from '../../../src/activities/shared/request-activity-status.enum';
import { FindRequestedMyActivitiesResponseDTO } from '../../../src/activities/requests/use-cases/dtos/find-my-requested-acitivities.dto';
import { ActivityRequestQueryService } from '../../../src/activities/requests/use-cases/interfaces/activity-request-query.service';

describe('ActivityRequestController', () => {
  let controller: ActivityRequestController;
  let activityRequestService: ActivityRequestService;
  let activityRequestQueryService: ActivityRequestQueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityRequestController],
      providers: [
        {
          provide: ActivityRequestService,
          useValue: {
            createRequestActivity: jest.fn(),
            updateMyRequestActivity: jest.fn(),
            updateApprovalRequestActivity: jest.fn(),
          },
        },
        {
          provide: ActivityRequestQueryService,
          useValue: {
            search: jest.fn(),
            searchMy: jest.fn(),
            findById: jest.fn(),
            findMyById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityRequestController>(
      ActivityRequestController,
    );
    activityRequestService = module.get<ActivityRequestService>(
      ActivityRequestService,
    );
    activityRequestQueryService = module.get<ActivityRequestQueryService>(
      ActivityRequestQueryService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findRequestedActivities', () => {
    it('should call findRequestedActivities with correct parameters', async () => {
      const query: FindRequestedActivityRequestDTO = {
        query: 'Test',
        page: 1,
        size: 10,
      };
      const expectedResponse = {
        items: [],
        metadata: {
          page: 1,
          size: 10,
          totalRecords: 0,
          totalPages: 10,
        },
      } as FindRequestedActivitiesResponseDTO;

      jest
        .spyOn(activityRequestQueryService, 'search')
        .mockResolvedValue(expectedResponse);

      const result = await controller.search(query);

      expect(activityRequestQueryService.search).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findMyRequestedActivities', () => {
    it('should call findMyRequestedActivities with correct user ID', async () => {
      const user: JwtPayload = { sub: '12345' };
      const expectedResponse = {
        items: [],
        metadata: {
          page: 1,
          size: 10,
          totalRecords: 0,
          totalPages: 10,
        },
      } as FindRequestedMyActivitiesResponseDTO;

      jest
        .spyOn(activityRequestQueryService, 'searchMy')
        .mockResolvedValue(expectedResponse);

      const result = await controller.searchMy(user, {
        status: [],
      });

      expect(activityRequestQueryService.searchMy).toHaveBeenCalledWith({
        status: [],
        userId: user.sub,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findMyRequestedActivity', () => {
    it('should call findMyRequestedActivity with correct parameters', async () => {
      const id = 1;
      const user: JwtPayload = { sub: '12345' };
      const expectedResponse = {
        id: 1,
        requestType: 'string',
        timeOfDay: {
          id: 'string',
          name: 'string',
        },
        dayOfWeek: {
          id: 'string',
          name: 'string',
        },
        author: {
          id: 'string',
          fullName: 'string',
        },
      } as FindRequestedMyActivityResponseDTO;

      jest
        .spyOn(activityRequestQueryService, 'findMyById')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findMyById(id, '12345');

      expect(activityRequestQueryService.findMyById).toHaveBeenCalledWith(
        id,
        user.sub,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findRequestedActivity', () => {
    it('should call findRequestedActivity with correct parameters', async () => {
      const id = 1;
      const expectedResponse = {
        id: 1,
        requestType: 'string',
        timeOfDay: {
          id: 'string',
          name: 'string',
        },
        dayOfWeek: {
          id: 'string',
          name: 'string',
        },
        author: {
          id: 'string',
          fullName: 'string',
        },
      } as FindRequestedMyActivityResponseDTO;

      jest
        .spyOn(activityRequestQueryService, 'findById')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findById(id);

      expect(activityRequestQueryService.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createRequestedActivity', () => {
    it('should call createRequestActivity with correct parameters', async () => {
      const dto: CreateActivityRequestRequest = {
        requestType: 'string',
        timeOfDayId: 'string',
        dayOfWeekId: 'string',
      };

      await controller.createRequestedActivity(dto, '12345');

      expect(activityRequestService.createRequestActivity).toHaveBeenCalledWith(
        {
          ...dto,
          authorId: '12345',
        },
      );
    });
  });

  describe('updateRequestedActivity', () => {
    it('should call updateMyRequestActivity with correct parameters', async () => {
      const id = 1;
      const dto: UpdateMyActivityRequestRequest = {
        timeOfDayId: '1',
        dayOfWeekId: '1',
      };

      await controller.updateRequestedActivity(id, dto, '12345');

      expect(
        activityRequestService.updateMyRequestActivity,
      ).toHaveBeenCalledWith({
        id,
        ...dto,
        authorId: '12345',
      });
    });
  });

  describe('updateApprovalRequestedActivity', () => {
    it('should call updateApprovalRequestActivity with correct parameters', async () => {
      const dto: UpdateApprovalActivityRequestRequest = {
        action: ApprovalRequestAction.APPROVE,
        ids: [1],
      };

      await controller.updateApprovalRequestedActivity(dto, '12345');

      expect(
        activityRequestService.updateApprovalRequestActivity,
      ).toHaveBeenCalledWith({
        ...dto,
        authorId: '12345',
      });
    });
  });
});
