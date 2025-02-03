import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateChoiceResponseDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  isCorrect: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Expose()
  position: number;

  static fromAiChoice(choice: any): CreateChoiceResponseDto {
    return {
      content: choice.content,
      isCorrect: choice.isCorrect,
      position: choice.position,
    };
  }
}
