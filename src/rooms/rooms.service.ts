import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  // TODO: 방 생성
  // async create(createRoomDto: CreateRoomDto): Promise<Room> {
  //   const room = this.roomRepository.create(createRoomDto);
  //   return await this.roomRepository.save(room);
  // }

  // TODO: 전체 방 목록 조회
  // async findAll(): Promise<Room[]> {
  //   return await this.roomRepository.find();
  // }

  // TODO: 특정 방 조회
  // async findOne(id: string): Promise<Room> {
  //   const room = await this.roomRepository.findOne({ where: { id } });
  //   if (!room) {
  //     throw new NotFoundException(`Room with ID ${id} not found`);
  //   }
  //   return room;
  // }

  // TODO: 방의 현재 접속자 관리
  // - 메모리 캐시 또는 Redis 사용
  // - Map<roomId, Set<userId>>

  // TODO: 방 업데이트/삭제
}
