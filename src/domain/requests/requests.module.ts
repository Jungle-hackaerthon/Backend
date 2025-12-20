import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestResponse } from './entities/request-response.entity';
import { Request } from './entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Request, RequestResponse])],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
