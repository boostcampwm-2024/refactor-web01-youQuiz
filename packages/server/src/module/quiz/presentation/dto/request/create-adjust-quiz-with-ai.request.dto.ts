import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ConversationMessageDto } from './conversation-message.request.dto';

export class CreateAdjustedQuizWithAiDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessageDto)
  conversationHistory: ConversationMessageDto[];
}
