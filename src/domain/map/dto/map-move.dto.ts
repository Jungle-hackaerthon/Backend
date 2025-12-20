import { IsEnum, IsNumber } from 'class-validator';

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

// 양수만 입력받음. direction 으로 위치조정
export class MapMoveDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsEnum(Direction)
  direction: Direction;
}
