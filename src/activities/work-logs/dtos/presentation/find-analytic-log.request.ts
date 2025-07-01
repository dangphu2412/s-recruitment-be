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
