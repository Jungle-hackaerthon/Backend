import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, nickname } = signupDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      hashedPassword,
      nickname,
      pointBalance: 1000,
    });

    const savedUser = await this.userRepository.save(user);

    const accessToken = await this.generateToken(
      savedUser.id,
      savedUser.email,
      savedUser.nickname,
    );

    return {
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          nickname: savedUser.nickname,
          points: savedUser.pointBalance,
          createdAt: savedUser.createdAt,
        },
        accessToken,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    const accessToken = await this.generateToken(
      user.id,
      user.email,
      user.nickname,
    );

    return {
      success: true,
      message: '로그인되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          points: user.pointBalance,
        },
        accessToken,
      },
    };
  }

  logout() {
    return {
      success: true,
      message: '로그아웃되었습니다.',
    };
  }

  private async generateToken(userId: string, email: string, nickname: string) {
    const payload = { sub: userId, email, nickname };

    const accessToken = await this.jwtService.signAsync(payload);

    return accessToken;
  }
}
