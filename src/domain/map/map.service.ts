import { Injectable } from '@nestjs/common';
import { Direction } from './dto/map-move.dto';

export interface UserPosition {
  userId: string;
  nickname: string;
  x: number;
  y: number;
  direction: Direction;
  organizationId: string;
  socketId: string;
}

@Injectable()
export class MapService {
  private users: Map<string, UserPosition> = new Map();

  joinMap(
    socketId: string,
    userId: string,
    nickname: string,
    organizationId: string,
    x: number,
    y: number,
  ): UserPosition {
    const userPosition: UserPosition = {
      userId,
      nickname,
      x,
      y,
      direction: Direction.DOWN,
      organizationId,
      socketId,
    };

    this.users.set(socketId, userPosition);
    return userPosition;
  }

  moveUser(
    socketId: string,
    x: number,
    y: number,
    direction: Direction,
  ): UserPosition | null {
    const user = this.users.get(socketId);
    if (!user) {
      return null;
    }

    user.x = x;
    user.y = y;
    user.direction = direction;

    return user;
  }

  leaveMap(socketId: string): UserPosition | null {
    const user = this.users.get(socketId);
    if (user) {
      this.users.delete(socketId);
      return user;
    }
    return null;
  }

  getUsersByOrganization(organizationId: string): UserPosition[] {
    return Array.from(this.users.values()).filter(
      (user) => user.organizationId === organizationId,
    );
  }

  getUserBySocketId(socketId: string): UserPosition | null {
    return this.users.get(socketId) || null;
  }

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
