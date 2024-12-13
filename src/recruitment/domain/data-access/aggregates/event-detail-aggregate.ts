import { RecruitmentEvent } from '../entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../entities/recruitment-employee.entity';

export type EventDetailAggregate = RecruitmentEvent & {
  employees: Array<
    RecruitmentEmployee & {
      point: number;
      myVotedPoint: number;
      myNote: string;
      voteStatus: string;
    }
  >;
};
