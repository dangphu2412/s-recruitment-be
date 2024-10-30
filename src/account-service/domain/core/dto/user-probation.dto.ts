import { Page } from '../../../../system/query-shape/types';

type UserProbation = {
  id: string;
  email: string;
  probationEndDate: Date;
  createdAt: Date;
};

export type PaginatedUserProbationDTO = Page<UserProbation>;
