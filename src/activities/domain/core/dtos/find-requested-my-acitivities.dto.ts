import { Page } from '../../../../system/query-shape/types';

export type FindRequestedMyActivitiesResponseDTO = Page<{
  id: number;
  requestType: string;
  timeOfDay: string;
  dayOfWeek: string;
  author: {
    id: string;
    fullName: string;
  };
}>;
