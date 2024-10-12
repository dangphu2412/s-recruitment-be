import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export type UpgradeUserMemberInput = {
  ids: string[];
  monthlyConfigId: number;
};

export class UpgradeUserMemberInputDto implements UpgradeUserMemberInput {
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @IsNotEmpty()
  monthlyConfigId: number;
}
