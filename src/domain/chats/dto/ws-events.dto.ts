import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MessageType } from './send-message.dto';
import { ReferenceType } from '../entities/chat-room.entity';

export class ChatJoinDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsEnum(ReferenceType)
  referenceType?: ReferenceType;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class ChatSendDto {
  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsEnum(ReferenceType)
  referenceType?: ReferenceType;

  @IsOptional()
  @IsString()
  referenceId?: string;

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
