import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { QUIZ_DIFFICULTY } from '@shared/constants/quiz-difficulty.enum';
import { CreateChoiceRequestDto } from './create-choice.request.dto';

export class CreateChoiceWithAiDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceRequestDto)
  choices: CreateChoiceRequestDto[];

  @IsEnum(QUIZ_DIFFICULTY)
  @IsNotEmpty()
  difficulty: QUIZ_DIFFICULTY;

  @IsNumber()
  @IsNotEmpty()
  count: number;
}
