import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/entities/product.entity';
import { Request } from '../requests/entities/request.entity';
import { envConfig } from '../../config/env.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, Message, User, Product, Request]),
    JwtModule.register({
      secret: envConfig.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
