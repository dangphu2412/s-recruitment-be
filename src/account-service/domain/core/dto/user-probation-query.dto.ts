import { OffsetPagination } from '../../../../system/query-shape/dto';

export type UserProbationQueryDTO = {
  departmentId?: string;
  periodId: string;
} & OffsetPagination;
