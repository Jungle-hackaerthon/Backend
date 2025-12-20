import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DmGateway } from './dm.gateway';
import { DmService } from './dm.service';
import { DmThread } from '../entities/dm-thread.entity';
import { DmMessage } from '../entities/dm-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DmThread, DmMessage])],
  providers: [DmGateway, DmService],
  exports: [DmService],
})
export class DmModule {}

// TODO: REST API 컨트롤러 추가 시
// - DmController 생성
// - 스레드 목록 조회 API
// - 메시지 히스토리 조회 API
