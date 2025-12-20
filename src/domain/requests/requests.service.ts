import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestResponse } from './entities/request-response.entity';
import { Request } from './entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(RequestResponse)
    private readonly requestResponsesRepository: Repository<RequestResponse>,
  ) {}

  // TODO: 요청/응답 처리 로직 추가
}
