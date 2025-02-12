import { IsArray, ValidateNested } from 'class-validator';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { CreateQuizResponseDto } from './create-quiz.response.dto';

export class CreateQuizWithAiResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizResponseDto)
  @Expose()
  quizzes: CreateQuizResponseDto[];

  static fromAiResponse(aiResponse: any): CreateQuizWithAiResponseDto {
    return plainToInstance(CreateQuizWithAiResponseDto, {
      quizzes: aiResponse.quizzes.map((quiz: any) =>
        plainToInstance(CreateQuizResponseDto, quiz, { enableImplicitConversion: true }),
      ),
    });
  }
}
