import { PartialType } from '@nestjs/swagger';
import { CreateRecruitmentEventDto } from './create-recruitment-event.dto';

export class UpdateRecruitmentDto extends PartialType(
  CreateRecruitmentEventDto,
) {}
