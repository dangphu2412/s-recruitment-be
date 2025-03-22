import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class UpgradeUserMemberRequest {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @IsNotEmpty()
  monthlyConfigId: number;
}
