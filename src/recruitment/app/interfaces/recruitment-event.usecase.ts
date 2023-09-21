import {
  CreateRecruitmentCommand,
  ImportEmployeesCommand,
  MarkEmployeePointCommand,
} from '../types/recruitment-event-command';
import { RecruitmentEvent } from '../../domain/entities/recruitment-event.entity';
import { createInterfaceToken } from '../../../system/utils';

export interface RecruitmentEventUseCase {
  findAll(): Promise<RecruitmentEvent[]>;
  findOne(id: number, authorId: string): Promise<any>;
  create(command: CreateRecruitmentCommand): Promise<void>;
  importEmployees(command: ImportEmployeesCommand): Promise<void>;
  markPointForEmployee(command: MarkEmployeePointCommand): Promise<void>;
}

export const RecruitmentEventUseCaseToken = createInterfaceToken(
  'RecruitmentEventUseCase',
);
