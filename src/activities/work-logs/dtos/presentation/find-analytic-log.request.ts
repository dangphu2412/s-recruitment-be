export class FindAnalyticLogRequest {
  fromDate?: string;
  toDate?: string;
}

export enum GroupType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class FindV2AnalyticLogRequest {
  fromDate?: string;
  toDate?: string;
  groupType?: GroupType;
}

export type FindV2AnalyticLogResponse = {
  items: {
    lateCount: number;
    onTimeCount: number;
    notFinishedCount: number;
    date?: string;
  }[];
};
