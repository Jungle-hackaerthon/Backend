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
import { DmService } from './dm.service';
import { socketConfig } from '../config/socket.config';

@WebSocketGateway(socketConfig)
export class DmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly dmService: DmService) {}

  handleConnection(client: Socket) {
    console.log(`DM client connected: ${client.id}`);
    // TODO: 인증 확인
  }

  handleDisconnect(client: Socket) {
    console.log(`DM client disconnected: ${client.id}`);
  }

  // TODO: DM 스레드 입장
  // @SubscribeMessage('join_dm_thread')
  // async handleJoinThread(
  //   @MessageBody() data: { threadId: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   client.join(data.threadId);
  //   // 기존 메시지 불러오기
  // }

  // TODO: DM 메시지 전송
  // @SubscribeMessage('send_dm')
  // async handleSendMessage(
  //   @MessageBody() data: { threadId: string; content: string; senderId: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const message = await this.dmService.sendMessage(
  //     data.threadId,
  //     data.senderId,
  //     data.content,
  //   );
  //   // 스레드 참여자들에게 메시지 전송
  //   this.server.to(data.threadId).emit('new_dm_message', message);
  // }

  // TODO: 타이핑 상태 전송
  // @SubscribeMessage('typing')
  // handleTyping(
  //   @MessageBody() data: { threadId: string; userId: string; isTyping: boolean },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   client.broadcast.to(data.threadId).emit('user_typing', data);
  // }
}
