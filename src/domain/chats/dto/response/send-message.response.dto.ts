import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../send-message.dto';

class SenderDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  id: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;
}

class SendMessageDataDto {
  @ApiProperty({ example: 'msg-uuid-004' })
  id: string;

  @ApiProperty({ type: SenderDto })
  sender: SenderDto;

  @ApiProperty({ example: '안녕하세요!' })
  content: string;

  @ApiProperty({ enum: MessageType, example: MessageType.TEXT })
  messageType: MessageType;

  @ApiProperty()
  createdAt: Date;
}

export class SendMessageResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: SendMessageDataDto })
  data: SendMessageDataDto;
}
