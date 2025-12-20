import { ApiProperty } from '@nestjs/swagger';

class HelperDto {
  @ApiProperty({ example: 'user-uuid-5678' })
  id: string;

  @ApiProperty({ example: '10기박영수' })
  nickname: string;
}

class ResponseDto {
  @ApiProperty({ example: 'response-uuid-001' })
  id: string;

  @ApiProperty({ type: HelperDto })
  helper: HelperDto;

  @ApiProperty({ example: 100 })
  proposedPrice: number;

  @ApiProperty({ example: null })
  status: string | null;

  @ApiProperty()
  createdAt: Date;
}

class FindResponsesDataDto {
  @ApiProperty({ type: [ResponseDto] })
  responses: ResponseDto[];
}

export class FindResponsesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: FindResponsesDataDto })
  data: FindResponsesDataDto;
}
