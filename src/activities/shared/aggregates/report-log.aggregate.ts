export type ReportLogAggregate = {
  id: string;
  email: string;
  lateCount: number;
};

export type ReportLogQueryResult = {
  author_email: string;
  author_id: string;
  late_count: string;
};
