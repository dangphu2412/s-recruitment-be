import { Injectable } from '@nestjs/common';
import { KPI } from './kpi.dto';
import { DataSource } from 'typeorm';
import {
  endOfMonth,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
} from 'date-fns';
import {
  UserActivityTrend,
  UserActivityTrendRequest,
  UserActivityTrendResponse,
} from './user-trend.dto';
import { GroupType } from '../activities/work-logs/dtos/presentation/find-analytic-log.request';
import { LogWorkStatus } from '../activities/work-logs/log-work-status.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async findKPI(): Promise<KPI> {
    const fromTime = startOfMonth(new Date()).toISOString();
    const toTime = endOfMonth(new Date()).toISOString();

    const SQL = `SELECT
        (SELECT COUNT("id") FROM "users" WHERE deleted_at IS null) as "totalActiveMembers",
        COALESCE((SELECT SUM("amount") FROM "payments" WHERE paid_at BETWEEN $1 AND $2), 0) "totalPayment",
        (SELECT COUNT("id") FROM "activity_requests" WHERE "updated_at" BETWEEN $1 AND $2 AND "approval_status" = 'P') as "totalPendingRequests",
        (SELECT COUNT(DISTINCT( track_id )) FROM "activity_logs" WHERE work_status = 'L' AND from_time >= $1 AND to_time <= $2) as "totalLateMembers"`;

    return (await this.dataSource.query<KPI[]>(SQL, [fromTime, toTime]))[0];
  }

  async findUserActivityTrends({
    groupType,
  }: UserActivityTrendRequest): Promise<UserActivityTrendResponse> {
    function getSelectDate() {
      if (groupType === GroupType.MONTHLY) {
        return `DATE_TRUNC('week', activity_logs.from_time) AS "date"`;
      }

      if (groupType === GroupType.YEARLY) {
        return `DATE_TRUNC('month', activity_logs.from_time) AS "date"`;
      }

      return `DATE(activity_logs.from_time) AS "date"`;
    }

    function getParams() {
      if (groupType === GroupType.MONTHLY) {
        return [
          subMonths(new Date(), 1).toISOString(),
          new Date().toISOString(),
        ];
      }

      if (groupType === GroupType.YEARLY) {
        return [
          startOfYear(new Date()).toISOString(),
          new Date().toISOString(),
        ];
      }
      return [
        startOfWeek(subWeeks(new Date(), 1)).toISOString(),
        new Date().toISOString(),
      ];
    }

    const items = await this.dataSource.query<UserActivityTrend[]>(
      `SELECT
        ${getSelectDate()},
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.LATE}' THEN 1 ELSE 0 END) AS "lateCount",
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.NOT_FINISHED}' THEN 1 ELSE 0 END) AS "notFinishedCount",
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.ON_TIME}' THEN 1 ELSE 0 END) as "onTimeCount"
      FROM activity_logs
      LEFT JOIN users ON activity_logs.track_id = users.tracking_id
      WHERE activity_logs.from_time >= $1 AND activity_logs.to_time <= $2
      GROUP BY "date" ORDER BY "date" DESC`,
      getParams(),
    );

    return {
      items,
    };
  }
}
