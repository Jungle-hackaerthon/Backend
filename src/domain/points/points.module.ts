import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PointTransaction } from './point-transaction.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointTransaction, User])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
