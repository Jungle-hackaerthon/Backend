import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/env.config';
import { RealtimeModule } from './infra/realtime/realtime.module';
import { MapModule } from './domain/map/map.module';
import { UsersModule } from './domain/users/users.module';
import { ProductsModule } from './domain/products/products.module';
import { RequestsModule } from './domain/requests/requests.module';
import { ChatsModule } from './chats/chats.module';
import { PointsModule } from './domain/points/points.module';
import { NotificationsModule } from './domain/notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RealtimeModule,
    MapModule,
    UsersModule,
    ProductsModule,
    RequestsModule,
    ChatsModule,
    PointsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// TODO: 추가 설정
// - ConfigModule (@nestjs/config) 적용 고려
// - ThrottlerModule (rate limiting)
// - ServeStaticModule (정적 파일 제공)
