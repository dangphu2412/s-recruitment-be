import { Page } from '../../../../system/query-shape/types';

export type FindRequestedActivitiesResponseDTO = Page<{
  id: number;
  requestType: string;
  timeOfDay: string;
  dayOfWeek: string;
  author: {
    id: string;
    fullName: string;
  };
}>;
