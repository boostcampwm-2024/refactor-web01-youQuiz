import { IsArray, ValidateNested } from 'class-validator';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { CreateQuizResponseDto } from './create-quiz.response.dto';

export class CreateQuizWithAiGeneratedResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizResponseDto)
  @Expose()
  quizzes: CreateQuizResponseDto[];

  static fromAiResponse(aiResponse: any): CreateQuizWithAiGeneratedResponseDto {
    return plainToInstance(CreateQuizWithAiGeneratedResponseDto, {
      quizzes: aiResponse.quizzes.map((quiz: any) =>
        plainToInstance(CreateQuizResponseDto, quiz, { enableImplicitConversion: true }),
      ),
    });
  }
}
