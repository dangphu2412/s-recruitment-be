import {
  CreateRecruitmentEventDTO,
  MarkEmployeePointDTO,
} from './dto/recruitment-event.dto';
import { RecruitmentEvent } from '../data-access/entities/recruitment-event.entity';
import { createInterfaceToken } from '../../../system/utils';
import { GetEventDetailDto } from './dto/get-event-detail.dto';

export interface RecruitmentEventService {
  findAll(): Promise<RecruitmentEvent[]>;
  findOne(dto: GetEventDetailDto): Promise<any>;
  create(createRecruitmentDTO: CreateRecruitmentEventDTO): Promise<void>;
  markPointForEmployee(
    markEmployeePointDTO: MarkEmployeePointDTO,
  ): Promise<void>;
  downloadEmployeesById(eventId: number): Promise<Buffer>;
}

export const RecruitmentEventServiceToken = createInterfaceToken(
  'RecruitmentEventService',
);
