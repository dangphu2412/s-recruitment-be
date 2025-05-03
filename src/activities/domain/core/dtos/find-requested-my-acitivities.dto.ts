import { OffsetPaginationResponse } from '../../../../system/pagination';

export type FindRequestedMyActivitiesResponseDTO = OffsetPaginationResponse<{
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
