import { DateRange } from '../../../../system/query-shape/dto/date-range.query';

export type FindActivitiesDTO = DateRange;

export type FindActivitiesResponseDTO = {
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
