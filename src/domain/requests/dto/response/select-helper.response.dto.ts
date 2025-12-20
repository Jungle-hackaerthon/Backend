import { ApiProperty } from '@nestjs/swagger';

class HelperDto {
  @ApiProperty({ example: 'user-uuid-9999' })
  id: string;

  @ApiProperty({ example: '10기최민수' })
  nickname: string;
}

class SelectedResponseDto {
  @ApiProperty({ example: 'response-uuid-002' })
  id: string;

  @ApiProperty({ type: HelperDto })
  helper: HelperDto;

  @ApiProperty({ example: 120 })
  proposedPrice: number;
}

class SelectHelperDataDto {
  @ApiProperty({ type: SelectedResponseDto })
  selectedResponse: SelectedResponseDto;
}

export class SelectHelperResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '도우미가 선택되었습니다.' })
  message: string;

  @ApiProperty({ type: SelectHelperDataDto })
  data: SelectHelperDataDto;
}
