import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { QUIZ_DIFFICULTY } from '@shared/constants/quiz-difficulty.enum';
import { UpdateUserChoiceWithAiRequestDto } from './update-user-choice-with-ai.request.dto';

export class CreateChoiceWithAiDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserChoiceWithAiRequestDto)
  choices: UpdateUserChoiceWithAiRequestDto[];

  @IsEnum(QUIZ_DIFFICULTY)
  @IsNotEmpty()
  difficulty: QUIZ_DIFFICULTY;

  @IsNumber()
  @IsNotEmpty()
  count: number;
}
