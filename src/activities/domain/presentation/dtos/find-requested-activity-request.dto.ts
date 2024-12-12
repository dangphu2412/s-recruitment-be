import { OffsetPagination } from '../../../../system/query-shape/dto';

export class FindRequestedActivityRequestDTO extends OffsetPagination {
  query: string;
}
