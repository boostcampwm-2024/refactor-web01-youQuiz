import { IsString } from 'class-validator';

export class CreateQuizWithAiDto {
  @IsString()
  text: string;
}
