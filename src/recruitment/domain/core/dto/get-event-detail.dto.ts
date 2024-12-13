import { VoteStatus } from '../constants/vote-status.enum';

export type GetEventDetailDto = {
  id: number;
  authorId: string;
  voteStatus: VoteStatus | null;
};
