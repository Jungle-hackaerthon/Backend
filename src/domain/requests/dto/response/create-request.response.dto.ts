import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../entities/request.entity';

class RequesterDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  id: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;
}

class CreateRequestDataDto {
  @ApiProperty({ example: 'request-uuid-1234' })
  id: string;

  @ApiProperty({ type: RequesterDto })
  requester: RequesterDto;

  @ApiProperty({ example: '10기김시연_0' })
  merchantName: string;

  @ApiProperty({ example: '택배실에서 물건 좀 찾아와주세요' })
  title: string;

  @ApiProperty({ example: '3층 택배실에 제 이름으로 온 택배 있어요.' })
  description: string;

  @ApiProperty({ example: 150 })
  proposedPrice: number;

  @ApiProperty({ example: 3 })
  mapId: number;

  @ApiProperty({ example: 200 })
  xPosition: number;

  @ApiProperty({ example: 300 })
  yPosition: number;

  @ApiProperty({ example: '2025-01-15T15:10:00.000Z' })
  deadline: Date;

  @ApiProperty({ enum: RequestStatus, example: RequestStatus.IN_PROGRESS })
  status: RequestStatus;

  @ApiProperty()
  createdAt: Date;
}

export class CreateRequestResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '요청이 생성되었습니다.' })
  message: string;

  @ApiProperty({ type: CreateRequestDataDto })
  data: CreateRequestDataDto;
}
