import { IsEnum, IsOptional } from 'class-validator';
import { VoteStatus } from '../../core/constants/vote-status.enum';

export class GetEventDetailRequest {
  @IsOptional()
  @IsEnum(VoteStatus)
  voteStatus: VoteStatus | null;
}
