import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Feedback } from '@shared/constants/feedback.enum';

export class CreateQuizFeedbackRequestDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  prompts: string[];

  @IsEnum(Feedback)
  @IsNotEmpty()
  feedback: Feedback;
}
