import { IsArray, ValidateNested } from 'class-validator';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { UpdateChoiceWithAiResponseDto } from './update-user-choice-with-ai.response.dto';

export class CreateChoiceWithAiResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChoiceWithAiResponseDto)
  @Expose()
  choices: UpdateChoiceWithAiResponseDto[];

  static fromAiChoice(quiz: any): CreateChoiceWithAiResponseDto {
    return plainToInstance(CreateChoiceWithAiResponseDto, quiz, {
      enableImplicitConversion: true,
    });
  }
}
