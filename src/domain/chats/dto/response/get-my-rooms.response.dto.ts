import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../send-message.dto';

class OpponentDto {
  @ApiProperty({ example: 'user-uuid-5678' })
  id: string;

  @ApiProperty({ example: '10기박영수' })
  nickname: string;
}

class LastMessageDto {
  @ApiProperty({ example: '안녕하세요!' })
  content: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  messageType: MessageType;

  @ApiProperty()
  createdAt: Date;
}

class RoomListItemDto {
  @ApiProperty({ example: 'room-uuid-1234' })
  id: string;

  @ApiProperty({ type: OpponentDto })
  opponent: OpponentDto;

  @ApiProperty({ type: LastMessageDto, nullable: true })
  lastMessage: LastMessageDto | null;

  @ApiProperty()
  createdAt: Date;
}

class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

class GetMyRoomsDataDto {
  @ApiProperty({ type: [RoomListItemDto] })
  rooms: RoomListItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class GetMyRoomsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: GetMyRoomsDataDto })
  data: GetMyRoomsDataDto;
}
