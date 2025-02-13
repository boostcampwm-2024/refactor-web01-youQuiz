import { IsNotEmpty, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserChoiceWithAiRequestDto {
  @IsNumber()
  @IsNotEmpty()
  position: number;

  @IsString()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
