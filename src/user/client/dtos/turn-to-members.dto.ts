import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class TurnToMembersDto {
  @IsString({
    each: true,
    always: true,
  })
  @ArrayNotEmpty()
  memberEmails: string[];

  @IsString()
  @IsNotEmpty()
  monthlyConfigId: string;
}
