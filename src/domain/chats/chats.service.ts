import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ChatRoom, ReferenceType } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { Product } from '../products/entities/product.entity';
import { Request } from '../requests/entities/request.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  /**
   * 채팅방 조회 또는 생성
   */
  async findOrCreateRoom(
    userId: string,
    referenceType: ReferenceType = ReferenceType.GENERAL,
    referenceId: string,
  ) {
    const roomOwner = await this.getRoomOwner(referenceType, referenceId);
    const roomOwnerId = roomOwner.id;

    // 본인과 채팅 방지
    if (userId === roomOwnerId) {
      throw new BadRequestException('본인과는 채팅할 수 없습니다.');
    }

    // user1 < user2 순서 보장 (DB 제약조건 준수)
    const [smallerId, largerId] =
      userId < roomOwnerId ? [userId, roomOwnerId] : [roomOwnerId, userId];

    // 기존 채팅방 조회 (user1-user2 + referenceType + referenceId 조합)
    const existingRoom = await this.chatRoomsRepository.findOne({
      where: {
        user1: { id: smallerId },
        user2: { id: largerId },
        referenceType,
        referenceId: referenceId,
      },
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
      throw new NotFoundException('현재 사용자가 존재하지 않습니다.');
    }

    const smallerUser = currentUser.id === smallerId ? currentUser : roomOwner;
    const largerUser = currentUser.id === largerId ? currentUser : roomOwner;

    const newRoom = this.chatRoomsRepository.create();
    newRoom.user1 = smallerUser;
    newRoom.user2 = largerUser;
    newRoom.referenceType = referenceType;
    newRoom.referenceId = referenceId;

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

  /**
   * reference 정보를 이용해 상대방 User 엔티티를 조회
   */
  private async getRoomOwner(
    referenceType: ReferenceType,
    referenceId?: string,
  ): Promise<User> {
    if (!referenceId) {
      throw new BadRequestException(
        'PRODUCT 또는 REQUEST 타입의 경우 referenceId가 필요합니다.',
      );
    }

    if (referenceType === ReferenceType.PRODUCT) {
      const product = await this.productsRepository.findOne({
        where: { id: referenceId },
        relations: ['seller'],
      });

      if (!product) {
        throw new NotFoundException('존재하지 않는 상품입니다.');
      }

      return product.seller;
    }

    if (referenceType === ReferenceType.REQUEST) {
      const request = await this.requestsRepository.findOne({
        where: { id: referenceId },
        relations: ['requester'],
      });

      if (!request) {
        throw new NotFoundException('존재하지 않는 요청입니다.');
      }

      return request.requester;
    }

    throw new BadRequestException('지원하지 않는 referenceType입니다.');
  }

  /**
   * Product별 채팅방 목록 조회 (판매자용)
   */
  async getRoomsByProduct(
    productId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // Product 존재 및 권한 확인
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException('존재하지 않는 상품입니다.');
    }

    if (product.seller.id !== userId) {
      throw new ForbiddenException('해당 상품의 판매자만 조회할 수 있습니다.');
    }

    // 해당 Product에 대한 채팅방 목록 조회
    const [rooms, total] = await this.chatRoomsRepository.findAndCount({
      where: {
        referenceType: ReferenceType.PRODUCT,
        referenceId: productId,
      },
      relations: ['user1', 'user2'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 각 채팅방의 마지막 메시지와 상대방(구매자) 정보 포함
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await this.messagesRepository.findOne({
          where: { room: { id: room.id } },
          relations: ['sender'],
          order: { createdAt: 'DESC' },
        });

        // 판매자가 아닌 사용자가 구매자
        const buyer = room.user1.id === userId ? room.user2 : room.user1;

        return {
          id: room.id,
          buyer: {
            id: buyer.id,
            nickname: buyer.nickname,
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
      rooms: roomsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 채팅방 ID를 resolve하고 권한을 검증하는 유틸 메서드
   * - roomId가 주어지면 권한 확인
   * - referenceType + referenceId가 주어지면 채팅방 조회 또는 생성
   * @throws BadRequestException, ForbiddenException, NotFoundException
   */
  async validateChatRoom(
    userId: string,
    payload: {
      roomId?: string;
      referenceType?: ReferenceType;
      referenceId?: string;
    },
  ): Promise<string> {
    // roomId가 주어진 경우
    if (payload.roomId) {
      const isParticipant = await this.isRoomParticipant(
        payload.roomId,
        userId,
      );

      if (!isParticipant) {
        throw new ForbiddenException('채팅방에 접근 권한이 없습니다.');
      }

      return payload.roomId;
    }

    // referenceType + referenceId가 주어진 경우 (채팅방 조회 또는 생성)
    if (payload.referenceType && payload.referenceId) {
      const { room } = await this.findOrCreateRoom(
        userId,
        payload.referenceType,
        payload.referenceId,
      );
      return room.id;
    }

    // 둘 다 없는 경우
    throw new BadRequestException(
      'roomId 또는 (referenceType + referenceId)가 필요합니다.',
    );
  }
}
