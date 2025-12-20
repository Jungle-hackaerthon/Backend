import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { MessagePaginationDto, PaginationDto } from './dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOrFindRoom,
  ApiGetMyRooms,
  ApiGetRoomDetail,
  ApiGetRoomMessages,
  ApiSendMessage,
} from '../../common/swagger/api.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * POST /chat/rooms
   * 채팅방 조회 또는 생성
   */
  @Post('rooms')
  @ApiCreateOrFindRoom()
  async createOrFindRoom(
    @UserId() userId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    const { room, isNew } = await this.chatsService.findOrCreateRoom(
      userId,
      createRoomDto.referenceType,
      createRoomDto.referenceId,
    );

    return {
      success: true,
      message: isNew
        ? '채팅방이 생성되었습니다.'
        : '기존 채팅방을 불러왔습니다.',
      data: {
        id: room.id,
        isNew,
        user1: {
          id: room.user1.id,
          nickname: room.user1.nickname,
        },
        user2: {
          id: room.user2.id,
          nickname: room.user2.nickname,
        },
        referenceType: room.referenceType,
        referenceId: room.referenceId,
        createdAt: room.createdAt,
      },
    };
  }

  /**
   * GET /chat/rooms
   * 내 채팅방 목록 조회
   */
  @Get('rooms')
  @ApiGetMyRooms()
  async getMyRooms(
    @UserId() userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.chatsService.getMyRooms(
      userId,
      paginationDto.page,
      paginationDto.limit,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /chat/products/:productId/rooms
   * Product별 채팅방 목록 조회 (판매자용)
   */
  @Get('products/:productId/rooms')
  async getRoomsByProduct(
    @UserId() userId: string,
    @Param('productId') productId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.chatsService.getRoomsByProduct(
      productId,
      userId,
      paginationDto.page,
      paginationDto.limit,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /chat/rooms/:id
   * 채팅방 상세 조회
   */
  @Get('rooms/:id')
  @ApiGetRoomDetail()
  async getRoomDetail(@UserId() userId: string, @Param('id') roomId: string) {
    const room = await this.chatsService.getRoomDetail(roomId, userId);

    return {
      success: true,
      data: room,
    };
  }

  /**
   * GET /chat/rooms/:id/messages
   * 채팅방 메시지 조회
   */
  @Get('rooms/:id/messages')
  @ApiGetRoomMessages()
  async getRoomMessages(
    @UserId() userId: string,
    @Param('id') roomId: string,
    @Query() paginationDto: MessagePaginationDto,
  ) {
    const result = await this.chatsService.getRoomMessages(
      roomId,
      userId,
      paginationDto.page,
      paginationDto.limit,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * POST /chat/rooms/:id/messages
   * 메시지 전송 (REST API)
   */
  @Post('rooms/:id/messages')
  @ApiSendMessage()
  async sendMessage(
    @UserId() userId: string,
    @Param('id') roomId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const message = await this.chatsService.sendMessage(
      roomId,
      userId,
      sendMessageDto,
    );

    return {
      success: true,
      data: message,
    };
  }
}
