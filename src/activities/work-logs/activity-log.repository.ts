import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ActivityLog } from '../shared/entities/activity-log.entity';
import { FindLogsRequest } from './dtos/presentation/find-logs.request';
import { subMonths, subWeeks } from 'date-fns';
import { LogWorkStatus } from './log-work-status.enum';
import { OffsetPaginationRequest } from '../../system/pagination/offset-pagination-request';
import {
  ReportLogAggregate,
  ReportLogQueryResult,
} from '../shared/aggregates/report-log.aggregate';

@Injectable()
export class ActivityLogRepository extends Repository<ActivityLog> {
  constructor(
    @InjectRepository(ActivityLog)
    repository: Repository<ActivityLog>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findLogs(findLogsRequest: FindLogsRequest) {
    const {
      workStatus,
      fromDate = subWeeks(new Date(), 1).toISOString(),
      toDate = new Date().toISOString(),
      authors,
      size,
      query,
    } = findLogsRequest;
    const offset = OffsetPaginationRequest.getOffset(
      findLogsRequest.page,
      findLogsRequest.size,
    );

    const queryBuilder = this.createQueryBuilder('activityLog')
      .leftJoinAndSelect('activityLog.author', 'author')
      .leftJoinAndSelect('activityLog.deviceAuthor', 'deviceAuthor')
      .select([
        'activityLog.fromTime',
        'activityLog.toTime',
        'activityLog.deviceUserId',
        'activityLog.workStatus',
        'activityLog.auditedFromTime',
        'activityLog.auditedToTime',
        'author.email',
        'author.id',
        'deviceAuthor.name',
      ]);

    if (workStatus !== undefined) {
      workStatus.forEach((status) => {
        queryBuilder.andWhere('activityLog.workStatus = :status', {
          status: status,
        });
      });
    }

    if (authors?.length) {
      queryBuilder.andWhere('author.id IN (:...authors)', {
        authors: authors,
      });
    }

    if (query) {
      queryBuilder.andWhere(
        '(author.username LIKE :usernameQuery OR deviceAuthor.name LIKE :nameQuery)',
        {
          usernameQuery: `${query}%`,
          nameQuery: `${query}%`,
        },
      );
    }

    return queryBuilder
      .andWhere('activityLog.fromTime >= :fromDate', { fromDate })
      .andWhere('activityLog.toTime <= :toDate', { toDate })
      .orderBy('activityLog.fromTime', 'DESC')
      .skip(offset)
      .take(size)
      .getManyAndCount();
  }

  async findLateReportLogs(): Promise<ReportLogAggregate[]> {
    const [sql, params] = this.createQueryBuilder('activityLog')
      .leftJoinAndSelect('activityLog.author', 'author')
      .leftJoinAndSelect('activityLog.deviceAuthor', 'deviceAuthor')
      .select(['author.email', 'author.id', 'author.fullName'])
      .addSelect('COUNT(author.id) as late_count')
      .andWhere('activityLog.fromTime >= :fromDate', {
        fromDate: subMonths(new Date(), 6),
      })
      .andWhere('activityLog.toTime <= :toDate', { toDate: new Date() })
      .andWhere('activityLog.workStatus = :status', {
        status: LogWorkStatus.LATE,
      })
      .orderBy('late_count', 'DESC')
      .addGroupBy('author.id')
      .addGroupBy('author.email')
      .addGroupBy('author.fullName')
      .getQueryAndParameters();

    const rawItems = await this.manager.query<ReportLogQueryResult[]>(
      sql,
      params,
    );

    return rawItems.map<ReportLogAggregate>((item) => {
      return {
        id: item.author_id,
        email: item.author_email,
        fullName: item.author_full_name,
        lateCount: +item.late_count,
      };
    });
  }

  updateLogs(activityLogs: ActivityLog[]) {
    return this.createQueryBuilder()
      .insert()
      .values(activityLogs)
      .orUpdate(
        ['work_status', 'audited_from_time', 'audited_to_time'],
        ['from_time', 'to_time', 'track_id'],
      )
      .execute();
  }
}
