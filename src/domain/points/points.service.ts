import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PointSourceType, PointTransaction } from './point-transaction.entity';
import { User } from '../users/user.entity';

@Injectable()
export class PointsService {
  // constructor(
  //   @InjectRepository(PointTransaction)
  //   private readonly pointTransactionsRepository: Repository<PointTransaction>,
  //   @InjectRepository(User)
  //   private readonly usersRepository: Repository<User>,
  //   private readonly dataSource: DataSource,
  // ) {}
  //   /**
  //    * 포인트 거래 처리 (트랜잭션)
  //    * @param payerId 포인트를 지불하는 사용자
  //    * @param receiverId 포인트를 받는 사용자
  //    * @param amount 거래 금액 (항상 양수)
  //    * @param sourceType 거래 유형
  //    */
  //   async processTransaction(
  //     payerId: string,
  //     receiverId: string,
  //     amount: number,
  //     //sourceType: PointSourceType,
  //   ): Promise<void> {
  //     if (amount <= 0) {
  //       throw new BadRequestException('Amount must be greater than 0');
  //     }
  //     // 트랜잭션으로 포인트 처리
  //     await this.dataSource.transaction(async (manager) => {
  //       // 지불자 조회
  //       const payer = await manager.findOne(User, { where: { id: payerId } });
  //       if (!payer) {
  //         throw new NotFoundException('Payer not found');
  //       }
  //       // 수령자 조회
  //       const receiver = await manager.findOne(User, {
  //         where: { id: receiverId },
  //       });
  //       if (!receiver) {
  //         throw new NotFoundException('Receiver not found');
  //       }
  //       // 포인트 잔액 확인
  //       if (payer.pointBalance < amount) {
  //         throw new BadRequestException('Insufficient point balance');
  //       }
  //       // 포인트 차감
  //       payer.pointBalance -= amount;
  //       await manager.save(User, payer);
  //       // 포인트 증가
  //       receiver.pointBalance += amount;
  //       await manager.save(User, receiver);
  //       // // 지불자 거래 기록 (user가 payer, counterparty가 receiver)
  //       // const payerTransaction = manager.create(PointTransaction, {
  //       //   user: { id: payerId },
  //       //   counterparty: { id: receiverId },
  //       //   amount: amount, // 항상 양수 (DB CHECK 제약)
  //       //   sourceType,
  //       // });
  //       // await manager.save(PointTransaction, payerTransaction);
  //       // // 수령자 거래 기록 (user가 receiver, counterparty가 payer)
  //       // const receiverTransaction = manager.create(PointTransaction, {
  //       //   user: { id: receiverId },
  //       //   counterparty: { id: payerId },
  //       //   amount: amount, // 항상 양수 (DB CHECK 제약)
  //       //   sourceType,
  //       // });
  //     });
  //   }
}
