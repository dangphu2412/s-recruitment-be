import { Page } from '../../../../system/query-shape/types';
import { OffsetPagination } from '../../../../system/query-shape/dto';

export type FindRequestedActivityQueryDTO = OffsetPagination & {
  query: string;
};

export type FindRequestedActivitiesResponseDTO = Page<{
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
