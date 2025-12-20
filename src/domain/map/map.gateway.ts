import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MapService } from './map.service';
import { MapJoinDto } from './dto/map-join.dto';
import { MapMoveDto } from './dto/map-move.dto';
import { socketConfig } from '../../config/socket.config';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MapSocketEvents } from './map.events';
import { Product } from '../products/entities/product.entity';
import { AuctionBid } from '../products/entities/auction-bid.entity';

@WebSocketGateway({
  namespace: '/map',
  ...socketConfig,
})
@UseGuards(WsJwtGuard)
export class MapGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly mapService: MapService) {}

  handleConnection(client: Socket) {
    console.log(`Map client connected: ${client.id}`);
    // TODO: JWT 인증 확인
    // const token = client.handshake.auth.token;
  }

  handleDisconnect(client: Socket) {
    console.log(`Map client disconnected: ${client.id}`);

    const user = this.mapService.leaveMap(client.id);
    if (user) {
      // 같은 맵의 다른 유저들에게 퇴장 알림
      const roomName = `map_${user.mapId}`;
      client.broadcast.to(roomName).emit(MapSocketEvents.USER_LEFT, {
        userId: user.userId,
      });
    }
  }

  // 물건생성 emit
  emitProductCreated(mapId: string, product: Product) {
    this.server.to(mapId).emit(MapSocketEvents.PRODUCT_CREATED, product);
  }
  // 물건수정 emit
  emitProductUpdated(mapId: string, product: Product) {
    this.server.to(mapId).emit(MapSocketEvents.PRODUCT_UPDATED, product);
  }

  // 물건삭제 emit
  emitProductRemoved(mapId: string, productId: string) {
    this.server.to(mapId).emit(MapSocketEvents.PRODUCT_REMOVED, { productId });
  }

  // 물건수정 emit
  emitBidCreated(mapId: string, bid: AuctionBid) {
    this.server.to(mapId).emit(MapSocketEvents.BID_CREATED, bid);
  }

  emitBidRemoved(mapId: string, bidId: string) {
    this.server.to(mapId).emit(MapSocketEvents.BID_REMOVED, { bidId });
  }

  emitAuctionEnded(
    mapId: string,
    data: {
      productId: string;
      winnerId: string | null;
      winningBid: number | null;
      sellerId: string;
    },
  ) {
    this.server.to(mapId).emit(MapSocketEvents.AUCTION_ENDED, data);
  }

  emitRequestCreated(mapId: number, request: any) {
    const roomName = `map_${mapId}`;
    this.server.to(roomName).emit(MapSocketEvents.REQUEST_CREATED, request);
  }

  emitRequestUpdated(mapId: number, request: any) {
    const roomName = `map_${mapId}`;
    this.server.to(roomName).emit(MapSocketEvents.REQUEST_UPDATED, request);
  }

  emitRequestDeleted(mapId: number, requestId: string) {
    const roomName = `map_${mapId}`;
    this.server
      .to(roomName)
      .emit(MapSocketEvents.REQUEST_DELETED, { id: requestId, mapId });
  }

  @SubscribeMessage(MapSocketEvents.MAP_JOIN)
  handleJoinMap(
    @MessageBody() joinDto: MapJoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: JWT에서 userId, nickname 추출
    const userId = client.data.user.id;
    const nickname = client.data.user.nickname;

    const mapId = joinDto.mapId ?? 0;
    const roomName = `map_${mapId}`;

    // 맵 입장
    const userPosition = this.mapService.joinMap(
      client.id,
      userId,
      nickname,
      mapId,
      joinDto.x,
      joinDto.y,
    );

    // Socket.IO room 입장
    client.join(roomName);

    // 현재 접속 중인 유저 목록 전송 (본인 제외)
    const users = this.mapService
      .getUsersByMap(mapId)
      .filter((u) => u.socketId !== client.id)
      .map((u) => ({
        userId: u.userId,
        nickname: u.nickname,
        x: u.x,
        y: u.y,
        direction: u.direction,
      }));

    client.emit(MapSocketEvents.USERS_LIST, users);

    // 다른 유저들에게 새 유저 입장 알림
    client.broadcast.to(roomName).emit(MapSocketEvents.USER_JOINED, {
      userId: userPosition.userId,
      nickname: userPosition.nickname,
      x: userPosition.x,
      y: userPosition.y,
      direction: userPosition.direction,
    });

    return { success: true };
  }

  @SubscribeMessage(MapSocketEvents.MAP_MOVE)
  handleMove(
    @MessageBody() moveDto: MapMoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    const updatedUser = this.mapService.moveUser(
      client.id,
      moveDto.x,
      moveDto.y,
      moveDto.direction,
    );

    // 연결해제된 상태일 가능성
    if (!updatedUser) {
      return { success: false, message: 'User not found in map' };
    }

    // 같은 맵의 다른 유저들에게 이동 알림
    const roomName = `map_${updatedUser.mapId}`;
    client.broadcast.to(roomName).emit(MapSocketEvents.USER_MOVED, {
      userId: updatedUser.userId,
      x: updatedUser.x,
      y: updatedUser.y,
      direction: updatedUser.direction,
    });

    return { success: true };
  }

  @SubscribeMessage(MapSocketEvents.MAP_LEAVE)
  handleLeaveMap(@ConnectedSocket() client: Socket) {
    const user = this.mapService.leaveMap(client.id);

    if (user) {
      const roomName = `map_${user.mapId}`;
      // Socket.IO room 퇴장
      client.leave(roomName);

      // 다른 유저들에게 퇴장 알림
      client.broadcast.to(roomName).emit(MapSocketEvents.USER_LEFT, {
        userId: user.userId,
      });

      return { success: true };
    }

    return { success: false, message: 'User not found in map' };
  }
}
