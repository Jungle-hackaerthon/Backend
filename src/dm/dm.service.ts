import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DmThread } from '../entities/dm-thread.entity';
import { DmMessage } from '../entities/dm-message.entity';

@Injectable()
export class DmService {
  constructor(
    @InjectRepository(DmThread)
    private readonly dmThreadRepository: Repository<DmThread>,
    @InjectRepository(DmMessage)
    private readonly dmMessageRepository: Repository<DmMessage>,
  ) {}

  // TODO: DM 스레드 찾기 또는 생성
  // async findOrCreateThread(userId1: string, userId2: string): Promise<DmThread> {
  //   // 두 사용자 간 기존 스레드 찾기
  //   // 없으면 새로 생성
  // }

  // TODO: 메시지 전송
  // async sendMessage(threadId: string, senderId: string, content: string): Promise<DmMessage> {
  //   const message = this.dmMessageRepository.create({
  //     threadId,
  //     senderId,
  //     content,
  //   });
  //   return await this.dmMessageRepository.save(message);
  // }

  // TODO: 스레드의 메시지 목록 조회
  // async getMessages(threadId: string, limit = 50): Promise<DmMessage[]> {
  //   return await this.dmMessageRepository.find({
  //     where: { threadId },
  //     order: { createdAt: 'DESC' },
  //     take: limit,
  //   });
  // }

  // TODO: 사용자의 DM 스레드 목록 조회
  // async getUserThreads(userId: string): Promise<DmThread[]> {
  //   // participantIds에 userId가 포함된 스레드 찾기
  // }
}
