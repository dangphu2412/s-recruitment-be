import { Inject, Injectable } from '@nestjs/common';
import { ActivityRequestService } from './interfaces/activity-request.service';
import { ActivityRequest } from '../../../system/database/entities/activity-request.entity';
import {
  RequestActivityStatus,
  RequestTypes,
} from '../../shared/request-activity-status.enum';
import { CreateActivityRequestDTO } from './dtos/create-activity-request.dto';
import { UpdateApprovalActivityRequestDTO } from './dtos/update-approval-activity-request.dto';
import { Transactional } from 'typeorm-transactional';
import {
  ActivityService,
  ActivityServiceToken,
} from '../../managements/interfaces/activity.service';
import { UpdateMyActivityRequestDTO } from './dtos/update-my-activity-request.dto';
import {
  FileActivityRequestDTO,
  FileActivityRequestRow,
} from './dtos/file-create-activity-request.dto';
import { read, utils } from 'xlsx';
import { UserService } from '../../../account-service/management/interfaces/user-service.interface';
import { keyBy } from 'lodash';
import { SystemRoles } from '../../../account-service/authorization/access-definition.constant';
import { ActivityRequestRepository } from '../infras/repositories/activity-request.repository';
import {
  MAIL_SERVICE_TOKEN,
  MailService,
} from '../../../system/mail/mail.interface';
import { renderToStaticMarkup } from 'react-dom/server';
import { AssignedRequestEmailTemplate } from './assigned-request-email-template';
import { ActivityRequestAggregate } from '../domain/aggregates/activity-request.aggregate';
import { ActivityRequestAggregateRepository } from '../domain/repositories/activity-request-aggregate.repository';
import { ActivityRequestApprovedEvent } from '../domain/events/activiy-request.event';
import { CreateActivityDTO } from '../../managements/dtos/core/create-activity.dto';
import { BusinessException } from '../../../system/exception/exception.service';

type ActivitySheetRequest = { dayOfWeekId: number; timeOfDayId: string };

type UserActivityRequest = {
  name: string;
  activitySheetRequests: ActivitySheetRequest[];
};

@Injectable()
export class ActivityRequestServiceImpl implements ActivityRequestService {
  constructor(
    @Inject(ActivityRequestRepository)
    private readonly activityRequestRepository: ActivityRequestRepository,
    @Inject(ActivityServiceToken)
    private readonly activityService: ActivityService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(MAIL_SERVICE_TOKEN)
    private readonly mailService: MailService,
    @Inject(ActivityRequestAggregateRepository)
    private readonly activityRequestAggregateRepository: ActivityRequestAggregateRepository,
  ) {}

  async createRequestActivityByFile({
    file,
  }: FileActivityRequestDTO): Promise<void> {
    const workbook = read(file.buffer, { type: 'buffer' });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const HEADER_ROW_COUNT = 2;
    const dataRows = utils
      .sheet_to_json<FileActivityRequestRow>(sheet, {
        header: 1,
        defval: '',
      })
      .slice(HEADER_ROW_COUNT);
    const results: UserActivityRequest[] = dataRows.map(
      ActivityRequestServiceImpl.createUserActivityRequestByRow,
    );

    const users = await this.userService.findUsersByFullNames([
      ...new Set(results.map((result) => result.name)),
    ]);
    const fullNameMapToUser = keyBy(users, 'fullName');

    const entities = results
      .map((result) => {
        const user = fullNameMapToUser[result.name];

        if (!user) {
          // Return the list of unmatch users
          return null;
        }

        return result.activitySheetRequests.map((registered) => {
          const entity = new ActivityRequest();
          entity.authorId = user.id;
          entity.requestType = RequestTypes.WORKING;
          entity.timeOfDayId = registered.timeOfDayId;
          entity.dayOfWeekId = registered.dayOfWeekId.toString();
          entity.approvalStatus = RequestActivityStatus.PENDING;

          return entity;
        });
      })
      .filter(Boolean)
      .flat();

    await this.activityRequestRepository.insert(entities);
  }

  static createUserActivityRequestByRow(row: string[]): UserActivityRequest {
    const user: UserActivityRequest = {
      name: row[1],
      activitySheetRequests: [],
    };
    const ACTIVITY_CELL_START_INDEX = 3;
    const TIME_SLOTS = ['SUM-MORN', 'SUM-AFT', 'SUM-EVN'] as const;
    const TIME_SLOTS_PER_DAY = TIME_SLOTS.length;

    for (let i = ACTIVITY_CELL_START_INDEX; i < row.length; i++) {
      const cell = row[i];
      if (['x', 'X'].includes(cell)) {
        const offset = i - ACTIVITY_CELL_START_INDEX;

        const dayIndexMondayBased = Math.floor(offset / TIME_SLOTS_PER_DAY); // 0 = Monday, 6 = Sunday
        const timeSlotIndex = offset % TIME_SLOTS_PER_DAY;

        // Convert to JS Date.getDay format: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayOfWeekId = (dayIndexMondayBased + 1) % 7;

        user.activitySheetRequests.push({
          dayOfWeekId,
          timeOfDayId: TIME_SLOTS[timeSlotIndex],
        });
      }
    }
    return user;
  }

  async createRequestActivity(dto: CreateActivityRequestDTO): Promise<void> {
    const assignee = await this.getAssignee();
    const newActivityRequest = ActivityRequestAggregate.createNew({
      ...dto,
      assigneeId: assignee.id,
    });
    const id =
      await this.activityRequestAggregateRepository.createNew(
        newActivityRequest,
      );

    const detailRequest =
      await this.activityRequestRepository.findDetailById(id);

    await this.mailService.sendMail({
      to: [assignee.email],
      subject: '[S-Group] Yêu cầu hoạt động',
      html: renderToStaticMarkup(
        AssignedRequestEmailTemplate({
          request: detailRequest,
        }),
      ),
    });
  }

  async getAssignee() {
    const { items } = await this.userService.findUsers({
      page: 1,
      search: '',
      size: 20,
      roleNames: [SystemRoles.HR] as string[],
    });

    return items[Math.floor(Math.random() * items.length)];
  }

  @Transactional()
  async updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void> {
    const { ids, action, rejectReason, reviseNote } = dto;

    const activityRequestAggregates =
      await this.activityRequestAggregateRepository.findByIds(ids);

    if (!activityRequestAggregates.length) {
      return;
    }

    activityRequestAggregates.forEach((aggregate) => {
      aggregate.updateApprovalStatus({
        approverId: dto.authorId,
        action,
        reviseNote,
        rejectReason,
      });
    });

    await this.activityRequestAggregateRepository.updateMany(
      activityRequestAggregates,
    );

    const newActivities: CreateActivityDTO[] = [];

    activityRequestAggregates.forEach((aggregate) => {
      const domainEvents = aggregate.getDomainEvents();

      domainEvents.forEach((domainEvent) => {
        if (domainEvent instanceof ActivityRequestApprovedEvent) {
          // Create activity when request is approved
          if (aggregate.needsActivityCreation()) {
            newActivities.push({
              authorId: domainEvent.activityData.authorId,
              requestType: domainEvent.activityData.requestType,
              timeOfDayId: domainEvent.activityData.timeOfDayId,
              dayOfWeekId: domainEvent.activityData.dayOfWeekId,
              requestChangeDay: domainEvent.activityData.requestChangeDay,
              compensatoryDay: domainEvent.activityData.compensatoryDay,
            });
          }
        }
      });

      aggregate.clearDomainEvents();
    });

    if (newActivities.length) {
      await this.activityService.createActivities(newActivities);
    }
  }

  async updateMyRequestActivity(dto: UpdateMyActivityRequestDTO) {
    const activityRequestAggregate =
      await this.activityRequestAggregateRepository.findMyUpdateRequestById(
        dto.id,
        dto.authorId,
      );

    if (!activityRequestAggregate) {
      throw new BusinessException({
        code: 'ACTIVITY_REQUEST_NOT_FOUND',
        message: 'Request not found',
      });
    }

    activityRequestAggregate.updateByAuthor(dto);

    await this.activityRequestAggregateRepository.updateMany([
      activityRequestAggregate,
    ]);
  }
}
