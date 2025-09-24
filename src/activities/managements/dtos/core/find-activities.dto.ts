import { DateRangeQuery } from '../../../../system/dates/date-range.query';

export type FindActivitiesDTO = DateRangeQuery & {
  authorId?: string;
  dayOfWeekId?: number;
};

export type FindActivitiesResponseDTO = {
  id: number;
  requestType: string;
  requestChangeDay: string;
  compensatoryDay: string;
  createdAt: Date;
  timeOfDay: {
    id: string;
    name: string;
    fromTime: string;
    toTime: string;
  };
  dayOfWeek: {
    id: string;
    name: string;
  };
}[];
