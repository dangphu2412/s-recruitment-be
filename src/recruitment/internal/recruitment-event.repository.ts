import { EntityRepository, Repository } from 'typeorm';
import { RecruitmentEvent } from '../client/entities/recruitment-event.entity';

@EntityRepository(RecruitmentEvent)
export class RecruitmentEventRepository extends Repository<RecruitmentEvent> {}
