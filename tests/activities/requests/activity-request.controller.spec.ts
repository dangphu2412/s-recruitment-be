import { Test, TestingModule } from '@nestjs/testing';
import { ActivityRequestController } from '../../../src/activities/requests/activity-request.controller';
import {
  ActivityRequestService,
  ActivityRequestServiceToken,
} from '../../../src/activities/requests/interfaces/activity-request.service';
import { FindRequestedActivityRequestDTO } from '../../../src/activities/requests/dtos/presentation/find-requested-activity-request.dto';
import { JwtPayload } from '../../../src/account-service/registration/jwt-payload';
import { CreateActivityRequestRequest } from '../../../src/activities/requests/dtos/presentation/create-activity-request.request';
import { UpdateMyActivityRequestRequest } from '../../../src/activities/requests/dtos/presentation/update-my-activity.request';
import { UpdateApprovalActivityRequestRequest } from '../../../src/activities/requests/dtos/presentation/update-approval-activity-request.request';
import { FindRequestedActivitiesResponseDTO } from '../../../src/activities/requests/dtos/core/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from '../../../src/activities/requests/dtos/core/find-requested-my-acitivity.dto';
import { ApprovalRequestAction } from '../../../src/activities/shared/request-activity-status.enum';
import { FindRequestedMyActivitiesResponseDTO } from '../../../src/activities/requests/dtos/core/find-my-requested-acitivities.dto';

describe('ActivityRequestController', () => {
  let controller: ActivityRequestController;
  let service: ActivityRequestService;

  beforeEach(async () => {
    const serviceMock = {
      findRequestedActivities: jest.fn(),
      findRequestedActivity: jest.fn(),
      findMyRequestedActivities: jest.fn(),
      findMyRequestedActivity: jest.fn(),
      createRequestActivity: jest.fn(),
      updateMyRequestActivity: jest.fn(),
      updateApprovalRequestActivity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityRequestController],
      providers: [
        {
          provide: ActivityRequestServiceToken,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ActivityRequestController>(
      ActivityRequestController,
    );
    service = module.get<ActivityRequestService>(ActivityRequestServiceToken);
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
        .spyOn(service, 'findRequestedActivities')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findRequestedActivities(query);

      expect(service.findRequestedActivities).toHaveBeenCalledWith(query);
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
        .spyOn(service, 'findMyRequestedActivities')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findMyRequestedActivities(user, {
        status: [],
      });

      expect(service.findMyRequestedActivities).toHaveBeenCalledWith({
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
        .spyOn(service, 'findMyRequestedActivity')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findMyRequestedActivity(id, user);

      expect(service.findMyRequestedActivity).toHaveBeenCalledWith(
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
        .spyOn(service, 'findRequestedActivity')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findRequestedActivity(id);

      expect(service.findRequestedActivity).toHaveBeenCalledWith(id);
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
      const user: JwtPayload = { sub: '12345' };

      await controller.createRequestedActivity(dto, user);

      expect(service.createRequestActivity).toHaveBeenCalledWith({
        ...dto,
        authorId: user.sub,
      });
    });
  });

  describe('updateRequestedActivity', () => {
    it('should call updateMyRequestActivity with correct parameters', async () => {
      const id = 1;
      const dto: UpdateMyActivityRequestRequest = {
        timeOfDayId: '1',
        dayOfWeekId: '1',
      };
      const user: JwtPayload = { sub: '12345' };

      await controller.updateRequestedActivity(id, dto, user);

      expect(service.updateMyRequestActivity).toHaveBeenCalledWith({
        id,
        ...dto,
        authorId: user.sub,
      });
    });
  });

  describe('updateApprovalRequestedActivity', () => {
    it('should call updateApprovalRequestActivity with correct parameters', async () => {
      const dto: UpdateApprovalActivityRequestRequest = {
        action: ApprovalRequestAction.APPROVE,
        ids: [1],
      };
      const user: JwtPayload = { sub: '12345' };

      await controller.updateApprovalRequestedActivity(dto, user);

      expect(service.updateApprovalRequestActivity).toHaveBeenCalledWith({
        ...dto,
        authorId: user.sub,
      });
    });
  });
});
