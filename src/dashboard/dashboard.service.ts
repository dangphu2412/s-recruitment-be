import { Injectable } from '@nestjs/common';
import { KPI } from './kpi.dto';
import { DataSource } from 'typeorm';
import { endOfMonth, startOfMonth } from 'date-fns';

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
}
