export type ReportLogAggregate = {
  id: string;
  email: string;
  fullName: string;
  lateCount: number;
};

export type ReportLogQueryResult = {
  author_email: string;
  author_full_name: string;
  author_id: string;
  late_count: string;
};
