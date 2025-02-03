import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { CreateChoiceResponseDto } from './create-choice.response.dto';
import { QuizType } from '../../../utils/quiz-type.enum';

export class CreateQuizResponseDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string;

  @IsEnum(QuizType)
  @IsNotEmpty()
  @Expose()
  quizType: QuizType;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  timeLimit: number;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  point: number;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  position: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceResponseDto)
  @Expose()
  choices: CreateChoiceResponseDto[];

  static fromAiQuiz(quiz: any): CreateQuizResponseDto {
    return plainToInstance(CreateQuizResponseDto, quiz, {
      enableImplicitConversion: true,
    });
  }
}
