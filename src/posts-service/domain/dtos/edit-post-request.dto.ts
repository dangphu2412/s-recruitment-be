import { IsNotEmpty } from 'class-validator';

export class EditPostRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
