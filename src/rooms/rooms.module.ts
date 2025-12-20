import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { Room } from '../entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}

// TODO: Controller 추가 시
// - RoomsController import
// - controllers: [RoomsController] 추가
