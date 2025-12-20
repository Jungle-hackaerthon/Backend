import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity';
import { User } from '../users/user.entity';

// export enum ProductStatus {
//   AVAILABLE = 'AVAILABLE',
//   RESERVED = 'RESERVED',
//   SOLD = 'SOLD',
// }

export enum PointSourceType {
  PRODUCT = 'PRODUCT',
  REQUEST = 'REQUEST',
}
@Entity('point_transactions')
export class PointTransaction extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'counterparty_id' })
  counterparty: User;

  @Column({ type: 'int' })
  amount: number;

  @Column({
    name: 'source_type',
    type: 'varchar',
    nullable: false,
  })
  sourceType: PointSourceType;
}
