import { OffsetPaginationResponse } from '../../../../system/pagination';

type UserProbation = {
  id: string;
  email: string;
  probationEndDate: Date;
  createdAt: Date;
};

export type PaginatedUserProbationDTO = OffsetPaginationResponse<UserProbation>;
