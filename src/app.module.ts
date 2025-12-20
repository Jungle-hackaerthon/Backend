import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/env.config';
import { MapModule } from './domain/map/map.module';
import { UsersModule } from './domain/users/users.module';
import { ProductsModule } from './domain/products/products.module';
import { PointsModule } from './domain/points/points.module';
import { NotificationsModule } from './domain/notifications/notifications.module';
import { AuthModule } from './domain/auth/auth.module';
import { ChatsModule } from './domain/chats/chats.module';
import { RequestsModule } from './domain/requests/requests.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
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
