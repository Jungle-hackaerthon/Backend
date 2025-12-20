import { IsString, IsUUID } from 'class-validator';

export class JoinRoomDto {
  @IsUUID()
  roomId: string;

  @IsString()
  userId: string;

  // TODO: 추가 필드
  // - 초기 위치 (x, y)
  // - 아바타 정보
}
