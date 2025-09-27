import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/account-service/management/interfaces/user-service.interface';

import { InternalFile } from '../../../src/system/file/file.interceptor';
import { ActivityRequestServiceImpl } from '../../../src/activities/requests/use-cases/activity-request.service';
import { ActivityRequestRepository } from '../../../src/activities/requests/infras/repositories/activity-request.repository';
import { ActivityServiceToken } from '../../../src/activities/managements/interfaces/activity.service';
import {
  ApprovalRequestAction,
  RequestActivityStatus,
  RequestTypes,
} from '../../../src/activities/shared/request-activity-status.enum';
import { ActivityRequest } from '../../../src/system/database/entities/activity-request.entity';
import { User } from '../../../src/system/database/entities/user.entity';
import { read, utils } from 'xlsx';
import { MAIL_SERVICE_TOKEN } from '../../../src/system/mail/mail.interface';
import { InsertResult } from 'typeorm';
import { ActivityRequestAggregateRepository } from '../../../src/activities/requests/domain/repositories/activity-request-aggregate.repository';
import { ActivityRequestAggregate } from '../../../src/activities/requests/domain/aggregates/activity-request.aggregate';

jest.mock('react-dom/server');
jest.mock('typeorm-transactional', () => ({
  Transactional: () => () => {},
}));
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));
jest.mock(
  '../../../src/activities/requests/use-cases/assigned-request-email-template',
);

describe('ActivityRequestServiceImpl', () => {
  let service: ActivityRequestServiceImpl;
  let activityRequestRepository: ActivityRequestRepository;
  let activityRequestAggregateRepository: ActivityRequestAggregateRepository;
  let activityService: any;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityRequestServiceImpl,
        {
          provide: ActivityRequestRepository,
          useValue: {
            insert: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findBy: jest.fn(),
            update: jest.fn(),
            findOverviewRequests: jest.fn(),
            findDetailById: jest.fn(),
          },
        },
        {
          provide: ActivityServiceToken,
          useValue: {
            createActivities: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUsers: jest.fn(),
            findUsersByFullNames: jest.fn(),
          },
        },
        {
          provide: MAIL_SERVICE_TOKEN,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ActivityRequestAggregateRepository,
          useValue: {
            createNew: jest.fn(),
            findByIds: jest.fn(),
            updateMany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ActivityRequestServiceImpl);
    activityRequestRepository = module.get(ActivityRequestRepository);
    activityRequestAggregateRepository = module.get(
      ActivityRequestAggregateRepository,
    );
    activityService = module.get(ActivityServiceToken);
    userService = module.get(UserService);
  });

  describe('createRequestActivity', () => {
    it('should insert mapped entity and assign assignee', async () => {
      const dto = {
        authorId: 'u1',
        requestType: RequestTypes.WORKING,
        timeOfDayId: 'MORN',
        dayOfWeekId: '1',
      };

      jest.spyOn(userService, 'findUsers').mockResolvedValue({
        items: [{ id: 'hr-1' }],
      } as any);
      jest
        .spyOn(activityRequestRepository, 'findDetailById')
        .mockResolvedValue({
          id: 1,
        } as ActivityRequest);
      jest.spyOn(activityRequestRepository, 'insert').mockResolvedValue({
        identifiers: [{ id: 1 }],
        generatedMaps: [],
        raw: '',
      } as InsertResult);

      await service.createRequestActivity(dto as any);

      expect(userService.findUsers).toHaveBeenCalled();
      expect(activityRequestAggregateRepository.createNew).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: 'u1',
          assigneeId: 'hr-1',
          requestType: RequestTypes.WORKING,
        }),
      );
    });
  });

  describe('updateApprovalRequestActivity', () => {
    it('should approve and create activity', async () => {
      const aggregate = new ActivityRequestAggregate();
      aggregate.id = 1;
      aggregate.authorId = 'u1';
      aggregate.approvalStatus = RequestActivityStatus.PENDING;
      aggregate.requestType = RequestTypes.WORKING;
      aggregate.timeOfDayId = 'MORN';
      aggregate.dayOfWeekId = '1';
      const requests = [aggregate];
      jest
        .spyOn(activityRequestAggregateRepository, 'findByIds')
        .mockResolvedValue(requests);
      jest
        .spyOn(activityRequestAggregateRepository, 'updateMany')
        .mockResolvedValue(undefined);
      jest
        .spyOn(activityService, 'createActivities')
        .mockResolvedValue(undefined);

      await service.updateApprovalRequestActivity({
        ids: [1],
        action: ApprovalRequestAction.APPROVE,
        authorId: 'approver-1',
      } as any);

      expect(activityService.createActivities).toHaveBeenCalled();
      expect(
        activityRequestAggregateRepository.updateMany,
      ).toHaveBeenCalledWith([
        expect.objectContaining({
          approvalStatus: 'APPROVED',
          approverId: 'approver-1',
          authorId: 'u1',
          dayOfWeekId: '1',
          domainEvents: [],
          id: 1,
          requestType: 'Working',
          timeOfDayId: 'MORN',
        }),
      ]);
    });

    it('should early stop if no requests found', async () => {
      jest
        .spyOn(activityRequestAggregateRepository, 'findByIds')
        .mockResolvedValue([]);

      await service.updateApprovalRequestActivity({
        ids: [99],
        action: ApprovalRequestAction.REJECT,
        authorId: 'hr',
      });

      expect(activityRequestRepository.update).not.toHaveBeenCalledWith();
    });
  });

  describe('createRequestActivityByFile', () => {
    it('should parse file and insert activity requests', async () => {
      // Arrange fake Excel file
      const file: InternalFile = {
        encoding: 'utf-8',
        fieldname: 'fieldname',
        buffer: Buffer.from(''),
        size: 10,
        mimetype: 'application/octet-stream',
        originalname: 'test.xlsx',
      };
      jest
        .spyOn(userService, 'findUsersByFullNames')
        .mockResolvedValue([{ id: 'u1', fullName: 'Alice' }] as User[]);
      jest
        .spyOn(activityRequestRepository, 'insert')
        .mockResolvedValue(undefined);

      // Spy on xlsx utils
      const sheet_to_json = jest.spyOn(utils, 'sheet_to_json');
      sheet_to_json.mockReturnValue([
        ['header1'], // row 0
        ['header2'], // row 1
        ['', 'Alice', '', 'x'], // row 2 with "x"
      ]);
      (read as jest.Mock).mockReturnValue({
        Sheets: { name: {} },
        SheetNames: ['name'],
      });

      // Act
      await service.createRequestActivityByFile({ file });

      // Assert
      expect(userService.findUsersByFullNames).toHaveBeenCalledWith(['Alice']);
      expect(activityRequestRepository.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            authorId: 'u1',
            requestType: RequestTypes.WORKING,
            approvalStatus: RequestActivityStatus.PENDING,
          }),
        ]),
      );
    });
  });
});
