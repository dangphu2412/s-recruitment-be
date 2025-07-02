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
  GroupType,
  UserActivityTrend,
  UserActivityTrendRequest,
  UserActivityTrendResponse,
} from './user-trend.dto';
import { LogWorkStatus } from '../activities/work-logs/log-work-status.enum';
import { MyKPI } from './my-kpi.dto';
import {
  MyActivityTrend,
  MyActivityTrendGroupType,
  MyActivityTrendRequest,
  MyActivityTrendResponse,
} from './my-activity-trend.dto';

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

  async findMyKPI(userId: string): Promise<MyKPI> {
    const fromTime = startOfMonth(new Date()).toISOString();
    const toTime = endOfMonth(new Date()).toISOString();

    const SQL = `
      WITH
total_payment AS (
  SELECT COALESCE(SUM(amount), 0) AS value
      FROM payments
      WHERE paid_at BETWEEN $1 AND $2
        AND user_id = $3
        ),
estimated_paid AS (
      SELECT
        (
        EXTRACT(YEAR FROM AGE(NOW(), u.joined_at)) * 12 +
        EXTRACT(MONTH FROM AGE(NOW(), u.joined_at))
        ) * mmc.amount AS value
      FROM users u
        LEFT JOIN operation_fees of ON u.operation_fee_id = of.id
        LEFT JOIN monthly_money_configs mmc ON of.monthly_config_id = mmc.id
      WHERE u.id = $3
        ),

pending_requests AS (
      SELECT COUNT(id) AS value
      FROM activity_requests
      WHERE updated_at BETWEEN $1 AND $2
        AND approval_status = 'P'
        AND author_id = $3
        ),

late_activities AS (
      SELECT COUNT(DISTINCT track_id) AS value
      FROM activity_logs
      WHERE work_status = 'L'
        AND from_time >= $1
        AND to_time <= $2
        ),

finished_work AS (
      SELECT COUNT(al.from_time) AS value
      FROM users u
        LEFT JOIN device_user_logs dul ON dul.device_user_id = u.tracking_id
        LEFT JOIN activity_logs al ON al.track_id = dul.device_user_id
      WHERE al.from_time >= $1
        AND al.to_time <= $2
        AND u.id = $3),

to_be_finished_work AS (
      SELECT COUNT(id) AS value
      FROM activities
      WHERE author_id = $3
)


SELECT
  tp.value AS "totalPayment",
  ep.value AS "estimatedPaid",
  pr.value AS "totalPendingRequests",
  la.value AS "totalLateActivities",
  fw.value AS "totalFinishedWork",
  tw.value AS "totalToBeFinishedWork"
FROM total_payment tp,
     estimated_paid ep,
     pending_requests pr,
     late_activities la,
     finished_work fw,
     to_be_finished_work tw`;

    return (
      await this.dataSource.query<MyKPI[]>(SQL, [fromTime, toTime, userId])
    )[0];
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
      WHERE activity_logs.from_time >= $1 AND activity_logs.to_time <= $2
      GROUP BY "date" ORDER BY "date" DESC`,
      getParams(),
    );

    return {
      items,
    };
  }

  async findMyActivityTrends({
    groupType,
    userId,
  }: MyActivityTrendRequest): Promise<MyActivityTrendResponse> {
    function getSelectDate() {
      if (groupType === MyActivityTrendGroupType.MONTHLY) {
        return `DATE_TRUNC('week', activity_logs.from_time) AS "date"`;
      }

      if (groupType === MyActivityTrendGroupType.YEARLY) {
        return `DATE_TRUNC('month', activity_logs.from_time) AS "date"`;
      }

      return `DATE(activity_logs.from_time) AS "date"`;
    }

    function getParams() {
      if (groupType === MyActivityTrendGroupType.MONTHLY) {
        return [
          subMonths(new Date(), 1).toISOString(),
          new Date().toISOString(),
          userId,
        ];
      }

      if (groupType === MyActivityTrendGroupType.YEARLY) {
        return [
          startOfYear(new Date()).toISOString(),
          new Date().toISOString(),
          userId,
        ];
      }
      return [
        startOfWeek(subWeeks(new Date(), 1)).toISOString(),
        new Date().toISOString(),
        userId,
      ];
    }

    const items = await this.dataSource.query<MyActivityTrend[]>(
      `SELECT
        ${getSelectDate()},
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.LATE}' THEN 1 ELSE 0 END) AS "lateCount",
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.NOT_FINISHED}' THEN 1 ELSE 0 END) AS "notFinishedCount",
        SUM(CASE WHEN activity_logs.work_status = '${LogWorkStatus.ON_TIME}' THEN 1 ELSE 0 END) as "onTimeCount"
      FROM activity_logs
      LEFT JOIN users ON activity_logs.track_id = users.tracking_id
      WHERE activity_logs.from_time >= $1 AND activity_logs.to_time <= $2
      AND users.id = $3
      GROUP BY "date" ORDER BY "date" DESC`,
      getParams(),
    );

    return {
      items,
    };
  }
}
