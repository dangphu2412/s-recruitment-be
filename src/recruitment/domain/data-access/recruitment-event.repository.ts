import { createInterfaceToken } from 'src/system/utils';
import { RecruitmentEvent } from './entities/recruitment-event.entity';
import { InsertResult, Repository } from 'typeorm';
import { EventDetailAggregate } from './aggregates/event-detail-aggregate';
import { GetEventDetailDTO } from './dto/get-event-detail.dto';

export interface RecruitmentEventRepository
  extends Repository<RecruitmentEvent> {
  isNameExisted(name: string): Promise<boolean>;
  insert(entity: RecruitmentEvent): Promise<InsertResult>;
  findAllEventsWithAuthorAndExaminers(): Promise<RecruitmentEvent[]>;
  findEventDetail(dto: GetEventDetailDTO): Promise<EventDetailAggregate>;
  findOneById(id: number): Promise<RecruitmentEvent>;
}

export const RecruitmentEventRepositoryToken = createInterfaceToken(
  'RecruitmentEventRepository',
);
