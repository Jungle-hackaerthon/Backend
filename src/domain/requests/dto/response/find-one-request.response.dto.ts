import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../entities/request.entity';

class UserDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  id: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;
}

class ResponseDto {
  @ApiProperty({ example: 'response-uuid-001' })
  id: string;

  @ApiProperty({ type: UserDto })
  helper: UserDto;

  @ApiProperty({ example: 100 })
  proposedPrice: number;

  @ApiProperty({ example: null })
  status: string | null;

  @ApiProperty()
  createdAt: Date;
}

class FindOneRequestDataDto {
  @ApiProperty({ example: 'request-uuid-1234' })
  id: string;

  @ApiProperty({ type: UserDto })
  requester: UserDto;

  @ApiProperty({ example: '10기김시연_0' })
  merchantName: string;

  @ApiProperty({ example: '택배실에서 물건 좀 찾아와주세요' })
  title: string;

  @ApiProperty({ example: '3층 택배실에 제 이름으로 온 택배 있어요. 가져다주시면 감사!' })
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

  @ApiProperty({ type: [ResponseDto] })
  responses: ResponseDto[];

  @ApiProperty({ type: ResponseDto, nullable: true })
  selectedResponse: ResponseDto | null;

  @ApiProperty()
  createdAt: Date;
}

export class FindOneRequestResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: FindOneRequestDataDto })
  data: FindOneRequestDataDto;
}
