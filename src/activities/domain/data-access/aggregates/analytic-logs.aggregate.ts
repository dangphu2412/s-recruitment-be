export type AnalyticLogsAggregate = {
  lateCount: number;
  onTimeCount: number;
  notFinishedCount: number;
};

export type AnalyticLogsAggregateDTO = {
  fromDate: string;
  toDate: string;
};
