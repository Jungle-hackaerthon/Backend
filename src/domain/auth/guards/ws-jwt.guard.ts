import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { envConfig } from '../../../config/env.config';
import { isArray } from 'class-validator';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const tokenFromAuth = client.handshake.auth?.token as string | undefined;
    let token = tokenFromAuth || client.handshake.headers.auth;

    if (!token) {
      throw new WsException('인증 토큰이 필요합니다.');
    }

    if (isArray(token)) {
      token = token[0];
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
