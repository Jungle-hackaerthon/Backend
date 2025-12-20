import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  id: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;
}

class RoomDetailDataDto {
  @ApiProperty({ example: 'room-uuid-1234' })
  id: string;

  @ApiProperty({ type: UserDto })
  user1: UserDto;

  @ApiProperty({ type: UserDto })
  user2: UserDto;

  @ApiProperty()
  createdAt: Date;
}

export class RoomDetailResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: RoomDetailDataDto })
  data: RoomDetailDataDto;
}
