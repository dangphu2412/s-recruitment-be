import { createInterfaceToken } from 'src/system/utils';
import { RecruitmentEvent } from '../../domain/entities/recruitment-event.entity';
import { InsertResult } from 'typeorm';

export interface RecruitmentEventRepository {
  isNameExisted(name: string): Promise<boolean>;
  insert(entity: RecruitmentEvent): Promise<InsertResult>;
  findAllEventsWithAuthorAndExaminers(): Promise<RecruitmentEvent[]>;
  findOneWithExaminersAndEmployeeById(id: number): Promise<RecruitmentEvent>;
  findOneById(id: number): Promise<RecruitmentEvent>;
}

export const RecruitmentEventRepositoryToken = createInterfaceToken(
  'RecruitmentEventRepository',
);
