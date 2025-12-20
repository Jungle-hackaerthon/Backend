import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, world!',
  })
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  @ApiProperty({
    description: 'The type of the message',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false,
  })
  messageType?: MessageType = MessageType.TEXT;
}
