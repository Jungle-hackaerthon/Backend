import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}

// TODO: 필요한 서비스 추가
// - RoomsService import
// - UsersService import (인증/사용자 관리)
