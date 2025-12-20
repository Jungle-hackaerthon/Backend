import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatsService } from './chats.service';
import { ChatJoinDto, ChatLeaveDto, ChatSendDto } from './dto/ws-events.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket) {
    console.log(`Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Chat client disconnected: ${client.id}`);
  }

  /**
   * chat:join - 채팅방 입장
   */
  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatJoinDto,
  ) {
    const userId = client.data.user.userId;
    const { roomId } = payload;
    try {
      // 권한 확인
      const isParticipant = await this.chatsService.isRoomParticipant(
        roomId,
        userId,
      );

      if (!isParticipant) {
        return {
          success: false,
          message: '채팅방에 접근 권한이 없습니다.',
        };
      }

      // 채팅방 소켓 룸에 join
      await client.join(`room:${roomId}`);

      return {
        success: true,
        message: '채팅방에 입장했습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '채팅방 입장에 실패했습니다.',
      };
    }
  }

  /**
   * chat:send - 메시지 전송
   */
  @SubscribeMessage('chat:send')
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatSendDto,
  ) {
    const userId = client.data.user.userId;
    const { roomId, content, messageType } = payload;

    try {
      // DB에 메시지 저장
      const savedMessage = await this.chatsService.sendMessage(roomId, userId, {
        content,
        messageType,
      });

      // 채팅방에 있는 모든 클라이언트에게 브로드캐스트
      this.server.to(`room:${roomId}`).emit('chat:message', {
        id: savedMessage.id,
        roomId,
        sender: savedMessage.sender,
        content: savedMessage.content,
        messageType: savedMessage.messageType,
        createdAt: savedMessage.createdAt,
      });

      // 전송자에게 성공 응답
      return {
        success: true,
        data: savedMessage,
      };
    } catch (error) {
      return {
        success: false,
        message: '메시지 전송에 실패했습니다.',
      };
    }
  }

  /**
   * chat:leave - 채팅방 퇴장
   */
  @SubscribeMessage('chat:leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatLeaveDto,
  ) {
    const { roomId } = payload;

    try {
      // 채팅방 소켓 룸에서 leave
      await client.leave(`room:${roomId}`);

      return {
        success: true,
        message: '채팅방에서 퇴장했습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '채팅방 퇴장에 실패했습니다.',
      };
    }
  }

  /**
   * REST API에서 메시지를 브로드캐스트하기 위한 헬퍼 메서드
   */
  sendToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }
}
