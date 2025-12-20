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
import { JoinRoomDto } from './dto/join-room.dto';
import { MoveDto } from './dto/move.dto';
import { socketConfig } from '../../config/socket.config';

@WebSocketGateway({
  namespace: '/realtime',
  ...socketConfig,
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // TODO: 연결 시 로직
    // - 인증 확인
    // - 사용자 정보 로드
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // TODO: 연결 해제 시 로직
    // - 현재 방에서 사용자 제거
    // - 다른 사용자들에게 알림
    // - 상태 저장
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() joinRoomDto: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('join_room:', joinRoomDto);
    // TODO: 방 입장 로직 구현
    // - 방 존재 확인
    // - 클라이언트를 Socket.IO 룸에 추가
    // - 현재 방의 다른 사용자 정보 전송
    // - 다른 사용자들에게 새 사용자 입장 알림

    client.join(joinRoomDto.roomId);
    // this.server.to(joinRoomDto.roomId).emit('user_joined', {...});
  }

  @SubscribeMessage('move')
  handleMove(
    @MessageBody() moveDto: MoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('move:', client);
    // TODO: 이동 로직 구현
    // - 위치 유효성 검증
    // - 같은 방의 다른 사용자들에게 브로드캐스트
    // - (선택) DB에 위치 저장

    // 예시: client.broadcast.to(roomId).emit('user_moved', moveDto);
  }
}
