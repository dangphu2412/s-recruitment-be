import { OffsetPagination } from '../../../../system/query-shape/dto';

export type UserProbationQueryDTO = {
  domainId?: number;
  periodId: number;
} & OffsetPagination;
