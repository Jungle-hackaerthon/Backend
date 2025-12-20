import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'kimsy@example.com' })
  email: string;

  @ApiProperty({ example: '10기김시연' })
  nickname: string;

  @ApiProperty({ example: 1000 })
  points: number;

  @ApiProperty()
  createdAt: Date;
}

class SignupDataDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refreshToken: string;
}

export class SignupResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '회원가입이 완료되었습니다.' })
  message: string;

  @ApiProperty({ type: SignupDataDto })
  data: SignupDataDto;
}
