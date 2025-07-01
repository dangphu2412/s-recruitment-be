export enum GroupType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class UserActivityTrendRequest {
  groupType: GroupType;
}

export type UserActivityTrendResponse = {
  items: UserActivityTrend[];
};

export type UserActivityTrend = {
  lateCount: number;
  onTimeCount: number;
  notFinishedCount: number;
  date: string;
};
