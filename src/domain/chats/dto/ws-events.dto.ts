import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageType } from './send-message.dto';

export class ChatJoinDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;
}

export class ChatSendDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(MessageType)
  messageType: MessageType;
}

export class ChatLeaveDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;
}
