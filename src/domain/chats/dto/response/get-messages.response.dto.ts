import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../send-message.dto';

class SenderDto {
  @ApiProperty({ example: 'user-uuid-5678' })
  id: string;

  @ApiProperty({ example: '10기박영수' })
  nickname: string;
}

class MessageDto {
  @ApiProperty({ example: 'msg-uuid-003' })
  id: string;

  @ApiProperty({ type: SenderDto })
  sender: SenderDto;

  @ApiProperty({ example: '네 가능합니다!' })
  content: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  messageType: MessageType;

  @ApiProperty()
  createdAt: Date;
}

class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

class GetMessagesDataDto {
  @ApiProperty({ type: [MessageDto] })
  messages: MessageDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class GetMessagesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: GetMessagesDataDto })
  data: GetMessagesDataDto;
}
