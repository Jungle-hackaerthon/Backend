import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './config/env.config';
import { RealtimeModule } from './realtime/realtime.module';
import { RoomsModule } from './rooms/rooms.module';
import { PostsModule } from './posts/posts.module';
import { DmModule } from './dm/dm.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    RealtimeModule,
    RoomsModule,
    PostsModule,
    DmModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// TODO: 추가 설정
// - ConfigModule (@nestjs/config) 적용 고려
// - ThrottlerModule (rate limiting)
// - ServeStaticModule (정적 파일 제공)
