import { IsNumber, IsString, Min } from 'class-validator';

export class MoveDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  x: number;

  @IsNumber()
  @Min(0)
  y: number;

  // TODO: 추가 필드
  // - 방향 (direction)
  // - 애니메이션 상태
  // - 속도
}
