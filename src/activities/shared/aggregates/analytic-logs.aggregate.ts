import { GroupType } from '../../work-logs/dtos/presentation/find-analytic-log.request';

export type AnalyticLogsAggregate = {
  lateCount: number;
  onTimeCount: number;
  notFinishedCount: number;
  logDate: string;
};

export type AnalyticLogsAggregateQuery = {
  fromDate: string;
  toDate: string;
  groupType?: GroupType;
};
