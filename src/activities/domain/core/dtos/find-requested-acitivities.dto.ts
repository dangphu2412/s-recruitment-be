import { OffsetPaginationResponse } from '../../../../system/pagination';
import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';

export type FindRequestedActivityQueryDTO = OffsetPaginationRequest & {
  query: string;
  departmentIds?: number[];
  fromDate?: string;
  toDate?: string;
  status?: string[];
  requestTypes?: string[];
};

export type FindRequestedActivitiesResponseDTO = OffsetPaginationResponse<{
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
