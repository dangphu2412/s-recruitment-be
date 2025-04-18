import { IsArray } from 'class-validator';

export class UpdateAssignedPersonsRequestDTO {
  @IsArray()
  userIds: string[];
}
