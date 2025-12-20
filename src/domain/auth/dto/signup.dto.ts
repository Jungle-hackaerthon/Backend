import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email for signup',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @ApiProperty({
    example: 'password123!',
    description: 'User password (at least 8 characters)',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'NewUser',
    description: 'User nickname',
  })
  nickname: string;
}
