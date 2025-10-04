import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';
import { LogWorkStatus } from '../../log-work-status.enum';

export type FindLogQueryDTO = OffsetPaginationRequest & {
  workStatus?: LogWorkStatus[];
  fromDate?: string;
  toDate?: string;
  authors?: string[];
  query?: string;
};
