import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';

export type UserProbationQueryDTO = {
  departmentId?: string;
  periodId: string;
} & OffsetPaginationRequest;
