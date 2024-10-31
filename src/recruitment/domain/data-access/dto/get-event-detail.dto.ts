import { VoteStatus } from '../../core/constants/vote-status.enum';

export type GetEventDetailDTO = {
  id: number;
  authorId: string;
  voteStatus: VoteStatus | null;
};
