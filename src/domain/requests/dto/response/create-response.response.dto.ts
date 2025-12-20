import { ApiProperty } from '@nestjs/swagger';

class HelperDto {
  @ApiProperty({ example: 'user-uuid-7777' })
  id: string;

  @ApiProperty({ example: '10기이영희' })
  nickname: string;
}

class CreateResponseDataDto {
  @ApiProperty({ example: 'response-uuid-003' })
  id: string;

  @ApiProperty({ type: HelperDto })
  helper: HelperDto;

  @ApiProperty({ example: 100 })
  proposedPrice: number;

  @ApiProperty()
  createdAt: Date;
}

export class CreateResponseResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '응찰되었습니다.' })
  message: string;

  @ApiProperty({ type: CreateResponseDataDto })
  data: CreateResponseDataDto;
}
