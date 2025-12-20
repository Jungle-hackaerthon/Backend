import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  id: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;
}

class RoomDataDto {
  @ApiProperty({ example: 'room-uuid-1234' })
  id: string;

  @ApiProperty({ example: false })
  isNew: boolean;

  @ApiProperty({ type: UserDto })
  user1: UserDto;

  @ApiProperty({ type: UserDto })
  user2: UserDto;

  @ApiProperty()
  createdAt: Date;
}

export class CreateRoomResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '기존 채팅방을 불러왔습니다.' })
  message: string;

  @ApiProperty({ type: RoomDataDto })
  data: RoomDataDto;
}
