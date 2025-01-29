import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { FindLogsRequest } from './domain/presentation/dtos/find-logs.request';
import { PageRequest } from '../system/query-shape/dto';
import { subWeeks } from 'date-fns';
import {
  AnalyticLogsAggregate,
  AnalyticLogsAggregateDTO,
} from './domain/data-access/aggregates/analytic-logs.aggregate';

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
      isLate,
      fromDate = subWeeks(new Date(), 1).toISOString(),
      toDate = new Date().toISOString(),
    } = findLogsRequest;
    const { offset, size } = PageRequest.of(findLogsRequest);

    const queryBuilder = this.createQueryBuilder('activityLog').leftJoin(
      'activityLog.author',
      'author',
    );

    if (isLate !== undefined) {
      queryBuilder.andWhere('activityLog.isLate = :isLate', {
        isLate: Boolean(isLate),
      });
    }

    return queryBuilder
      .andWhere('activityLog.fromTime >= :fromDate', { fromDate })
      .andWhere('activityLog.toTime <= :toDate', { toDate })
      .orderBy('activityLog.fromTime', 'DESC')
      .skip(offset)
      .take(size)
      .getManyAndCount();
  }

  async findAnalyticLogs({
    fromDate,
    toDate,
  }: AnalyticLogsAggregateDTO): Promise<AnalyticLogsAggregate> {
    const items = await this.query(
      `SELECT
        SUM(CASE WHEN activity_logs.is_late = true THEN 1 ELSE 0 END) AS "lateCount",
        SUM(CASE WHEN activity_logs.from_time = activity_logs.to_time THEN 1 ELSE 0 END) AS "notFinishedCount",
        SUM(CASE WHEN activity_logs.is_late = false and  activity_logs.from_time != activity_logs.to_time THEN 1 ELSE 0 END) as "onTimeCount"
      FROM activity_logs
      LEFT JOIN users ON activity_logs.track_id = users.tracking_id
      WHERE activity_logs.from_time >= $1 AND activity_logs.to_time <= $2`,
      [fromDate, toDate],
    );

    return items[0] ?? {};
  }

  updateLogs(activityLogs: ActivityLog[]) {
    return this.createQueryBuilder()
      .insert()
      .values(activityLogs)
      .orIgnore()
      .execute();
  }
}
