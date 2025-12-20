import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * 채팅방 조회 또는 생성
   */
  async findOrCreateRoom(userId: string, targetUserId: string) {
    // 본인과 채팅 방지
    if (userId === targetUserId) {
      throw new BadRequestException('본인과는 채팅할 수 없습니다.');
    }

    // 상대방 존재 확인
    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    // 기존 채팅방 조회 (user1-user2 또는 user2-user1 조합)
    const existingRoom = await this.chatRoomsRepository.findOne({
      where: [
        { user1: { id: userId }, user2: { id: targetUserId } },
        { user1: { id: targetUserId }, user2: { id: userId } },
      ],
      relations: ['user1', 'user2'],
    });

    if (existingRoom) {
      return { room: existingRoom, isNew: false };
    }

    // 없으면 새로 생성
    const currentUser = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!currentUser) {
      throw new BadRequestException('user가 존재하지 않습니다.');
    }

    const newRoom = this.chatRoomsRepository.create();
    newRoom.user1 = currentUser;
    newRoom.user2 = targetUser;

    const savedRoom = await this.chatRoomsRepository.save(newRoom);

    // relations 포함하여 다시 조회
    const roomWithRelations = await this.chatRoomsRepository.findOne({
      where: { id: savedRoom.id },
      relations: ['user1', 'user2'],
    });

    if (!roomWithRelations) {
      throw new NotFoundException('채팅방 생성에 실패했습니다.');
    }

    return { room: roomWithRelations, isNew: true };
  }

  /**
   * 내 채팅방 목록 조회
   */
  async getMyRooms(userId: string, page: number = 1, limit: number = 20) {
    const [rooms, total] = await this.chatRoomsRepository.findAndCount({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 각 채팅방의 마지막 메시지 조회
    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await this.messagesRepository.findOne({
          where: { room: { id: room.id } },
          relations: ['sender'],
          order: { createdAt: 'DESC' },
        });

        const opponent = room.user1.id === userId ? room.user2 : room.user1;

        return {
          id: room.id,
          opponent: {
            id: opponent.id,
            nickname: opponent.nickname,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                messageType: lastMessage.messageType,
                createdAt: lastMessage.createdAt,
              }
            : null,
          createdAt: room.createdAt,
        };
      }),
    );

    return {
      rooms: roomsWithLastMessage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 채팅방 상세 조회
   */
  async getRoomDetail(roomId: string, userId: string) {
    const room = await this.chatRoomsRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2'],
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    // 권한 확인
    if (room.user1.id !== userId && room.user2.id !== userId) {
      throw new ForbiddenException('해당 채팅방에 접근 권한이 없습니다.');
    }

    return {
      id: room.id,
      user1: {
        id: room.user1.id,
        nickname: room.user1.nickname,
      },
      user2: {
        id: room.user2.id,
        nickname: room.user2.nickname,
      },
      createdAt: room.createdAt,
    };
  }

  /**
   * 채팅방 메시지 조회
   */
  async getRoomMessages(
    roomId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    // 채팅방 존재 및 권한 확인
    const room = await this.chatRoomsRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2'],
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    if (room.user1.id !== userId && room.user2.id !== userId) {
      throw new ForbiddenException('해당 채팅방에 접근 권한이 없습니다.');
    }

    // 메시지 조회 (최신순 정렬)
    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { room: { id: roomId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      sender: {
        id: msg.sender.id,
        nickname: msg.sender.nickname,
      },
      content: msg.content,
      messageType: msg.messageType,
      createdAt: msg.createdAt,
    }));

    return {
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 메시지 전송 (REST API 또는 WebSocket에서 호출)
   */
  async sendMessage(roomId: string, senderId: string, dto: SendMessageDto) {
    // 채팅방 존재 및 권한 확인
    const room = await this.chatRoomsRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2'],
    });

    if (!room) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    if (room.user1.id !== senderId && room.user2.id !== senderId) {
      throw new ForbiddenException('해당 채팅방에 접근 권한이 없습니다.');
    }

    const sender = await this.usersRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new BadRequestException('user가 존재하지 않습니다.');
    }

    // 메시지 저장
    const message = this.messagesRepository.create();
    message.room = room;
    message.sender = sender;
    message.content = dto.content;
    message.messageType = dto.messageType || 'TEXT';

    const savedMessage = await this.messagesRepository.save(message);

    return {
      id: savedMessage.id,
      sender: {
        id: sender.id,
        nickname: sender.nickname,
      },
      content: savedMessage.content,
      messageType: savedMessage.messageType,
      createdAt: savedMessage.createdAt,
    };
  }

  /**
   * 채팅방 참여자 확인
   */
  async isRoomParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = await this.chatRoomsRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2'],
    });

    if (!room) {
      return false;
    }

    return room.user1.id === userId || room.user2.id === userId;
  }

  /**
   * 채팅방 상대방 ID 가져오기
   */
  async getOpponentId(roomId: string, userId: string): Promise<string | null> {
    const room = await this.chatRoomsRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2'],
    });

    if (!room) {
      return null;
    }

    return room.user1.id === userId ? room.user2.id : room.user1.id;
  }
}
