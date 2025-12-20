import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { envConfig } from '../../config/env.config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token;

    if (!token) {
      throw new WsException('인증 토큰이 필요합니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: envConfig.jwtSecret,
      });

      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        nickname: payload.nickname,
      };

      return true;
    } catch (error) {
      throw new WsException('유효하지 않은 토큰입니다.');
    }
  }
}
