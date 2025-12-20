import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointTransaction } from './point-transaction.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly pointTransactionsRepository: Repository<PointTransaction>,
  ) {}

  // TODO: 포인트 거래 로직 추가
}
