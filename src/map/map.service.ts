import { Injectable } from '@nestjs/common';
import { Direction } from './dto/map-move.dto';

export interface UserPosition {
  userId: string;
  nickname: string;
  x: number;
  y: number;
  direction: Direction;
  socketId: string;
}

@Injectable()
export class MapService {
  private users: Map<string, UserPosition> = new Map();

  joinMap(
    socketId: string,
    userId: string,
    nickname: string,
    x: number,
    y: number,
  ): UserPosition {
    const userPosition: UserPosition = {
      userId,
      nickname,
      x,
      y,
      direction: Direction.DOWN,
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

  getAllUsers(): UserPosition[] {
    return Array.from(this.users.values());
  }

  getUserBySocketId(socketId: string): UserPosition | null {
    return this.users.get(socketId) || null;
  }
}
