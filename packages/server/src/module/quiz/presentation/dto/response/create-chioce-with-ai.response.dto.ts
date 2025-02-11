import { IsArray, ValidateNested } from 'class-validator';
import { CreateChoiceResponseDto } from './create-choice.response.dto';
import { Expose, plainToInstance, Type } from 'class-transformer';

export class CreateChoiceWithAiResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceResponseDto)
  @Expose()
  choices: CreateChoiceResponseDto[];

  static fromAiChoice(quiz: any): CreateChoiceWithAiResponseDto {
    return plainToInstance(CreateChoiceWithAiResponseDto, quiz, {
      enableImplicitConversion: true,
    });
  }
}
