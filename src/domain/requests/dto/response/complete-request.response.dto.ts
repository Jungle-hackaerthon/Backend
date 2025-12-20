import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../entities/request.entity';

class RequestDto {
  @ApiProperty({ example: 'request-uuid-1234' })
  id: string;

  @ApiProperty({ enum: RequestStatus, example: RequestStatus.COMPLETED })
  status: RequestStatus;
}

class PointTransferDto {
  @ApiProperty({ example: 'user-uuid-1234' })
  from: string;

  @ApiProperty({ example: 'user-uuid-9999' })
  to: string;

  @ApiProperty({ example: 120 })
  amount: number;
}

class CompleteRequestDataDto {
  @ApiProperty({ type: RequestDto })
  request: RequestDto;

  @ApiProperty({ type: PointTransferDto })
  pointTransfer: PointTransferDto;
}

export class CompleteRequestResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '요청이 완료되었습니다. 120 포인트가 전송되었습니다.' })
  message: string;

  @ApiProperty({ type: CompleteRequestDataDto })
  data: CompleteRequestDataDto;
}
