import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../../common/base.entity';
import { Product } from './product.entity';
import { User } from '../../users/user.entity';

@Entity('auction_bids')
export class AuctionBid extends BaseTimestampEntity {
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bidder_id' })
  bidder: User;

  @Column({ name: 'bid_amount', type: 'int' })
  bidAmount: number;
}
