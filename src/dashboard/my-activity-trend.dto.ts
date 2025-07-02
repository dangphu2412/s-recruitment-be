export enum MyActivityTrendGroupType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class MyActivityTrendRequest {
  groupType: MyActivityTrendGroupType;
  userId: string;
}

export type MyActivityTrendResponse = {
  items: MyActivityTrend[];
};

export type MyActivityTrend = {
  lateCount: number;
  onTimeCount: number;
  notFinishedCount: number;
  date: string;
};
