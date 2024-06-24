import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostRequestDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  previewImage: string;

  @IsNotEmpty()
  summary: string;

  @IsArray()
  @IsString({ each: true })
  categoryCodes: string[];
}
