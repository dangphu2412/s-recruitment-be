import {
  CreateRecruitmentEventDTO,
  MarkEmployeePointDTO,
} from './dto/recruitment-event.dto';
import { RecruitmentEvent } from '../data-access/entities/recruitment-event.entity';
import { createInterfaceToken } from '../../../system/utils';

export interface RecruitmentEventService {
  findAll(): Promise<RecruitmentEvent[]>;
  findOne(id: number, authorId: string): Promise<any>;
  create(createRecruitmentDTO: CreateRecruitmentEventDTO): Promise<void>;
  markPointForEmployee(
    markEmployeePointDTO: MarkEmployeePointDTO,
  ): Promise<void>;
}

export const RecruitmentEventServiceToken = createInterfaceToken(
  'RecruitmentEventService',
);
