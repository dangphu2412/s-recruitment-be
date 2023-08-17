import { CreateRecruitmentEventDto } from '../dto/create-recruitment-event.dto';

export type CreateRecruitmentPayload = CreateRecruitmentEventDto & {
  userId: string;
};
