import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
