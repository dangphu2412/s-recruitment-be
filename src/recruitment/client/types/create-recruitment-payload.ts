import { CreateRecruitmentEventDto } from '../dto/create-recruitment-event.dto';
import { MarkEmployeeDto } from '../dto/mark-employee.dto';

export type CreateRecruitmentPayload = CreateRecruitmentEventDto & {
  authorId: string;
};

export type MarkEmployeePointPayload = MarkEmployeeDto & {
  authorId: string;
};
