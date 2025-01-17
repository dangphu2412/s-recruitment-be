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
    const { isLate, fromDate = subWeeks(new Date(), 1).toISOString(), toDate = new Date().toISOString() } = findLogsRequest;
    const { offset, size } = PageRequest.of(findLogsRequest);

    const queryBuilder = this.createQueryBuilder('activityLog').leftJoin(
      'activityLog.author',
      'author',
    );

    if (isLate !== undefined) {
      queryBuilder.andWhere('activityLog.isLate = :isLate', { isLate });
    }

    queryBuilder.andWhere('activityLog.fromTime >= :fromDate', { fromDate });
    queryBuilder.andWhere('activityLog.toTime <= :toDate', { toDate });

    queryBuilder.orderBy('activityLog.fromTime', 'DESC');
    queryBuilder.skip(offset);
    queryBuilder.take(size);

    return queryBuilder.getManyAndCount();
  }

  findAnalyticLogs({
    fromDate,
    toDate,
  }: AnalyticLogsAggregateDTO): Promise<AnalyticLogsAggregate> {
    return this.query(
      `
      SELECT
        COUNT(*) AS total_logs,
        SUM(CASE WHEN is_late = true THEN 1 ELSE 0 END) AS total_late_logs,
        SUM(CASE WHEN from_time = to_time THEN 1 ELSE 0 END) AS total_not_late_logs
      FROM activity_logs
      LEFT JOIN users ON activity_logs.track_id = users.tracking_id
      WHERE from_time >= $1 AND to_time <= $2
      GROUP BY users.tracking_id
    `,
      [fromDate, toDate],
    );
  }
}
