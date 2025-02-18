import { IsEnum, IsString } from 'class-validator';
import { RoleType } from 'src/module/quiz/domain/type/gpt-ai-role.enum';

export class ConversationMessageDto {
  @IsEnum(RoleType)
  role: RoleType;

  @IsString()
  text: string;
}
