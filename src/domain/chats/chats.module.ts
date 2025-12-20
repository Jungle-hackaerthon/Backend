import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, Message])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
