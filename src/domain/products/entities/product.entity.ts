import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseTimestampEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

@Entity('products')
export class Product extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({
    name: 'image_urls',
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  imageUrls: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  categories: string[];

  @Column({ type: 'varchar', default: 'AVAILABLE' })
  status: string;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp with time zone',
  })
  updatedAt?: Date;

  @Column({ name: 'current_price', type: 'int', nullable: true })
  currentPrice?: number;

  @Column({ name: 'start_price', type: 'int', nullable: true })
  startPrice?: number;

  // 입찰은 AuctionBid에서 단방향 매핑
}
