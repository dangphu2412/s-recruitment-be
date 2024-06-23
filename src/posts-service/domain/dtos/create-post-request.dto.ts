import { IsNotEmpty } from 'class-validator';

export class CreatePostRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
