import { Page } from '../../../../system/query-shape/types';

export type FindRequestedMyActivitiesResponseDTO = Page<{
  id: number;
  requestType: string;
  timeOfDay: {
    id: string;
    name: string;
  };
  dayOfWeek: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    fullName: string;
  };
}>;
