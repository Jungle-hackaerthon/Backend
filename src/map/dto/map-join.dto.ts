import { IsNumber } from 'class-validator';

// map 입장 시 위치
// TODO: 첫 위치 고정시키거나 DB에 저장해야함.
export class MapJoinDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}
