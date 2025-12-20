import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

@Entity('products')
export class Product extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'map_id', type: 'int', nullable: false })
  mapId: number;

  @Column({ name: 'x_position', type: 'int', nullable: false })
  xPosition: number;

  @Column({ name: 'y_position', type: 'int', nullable: false })
  yPosition: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'image_urls',
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  imageUrls: string[];

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  status: ProductStatus;

  @Column({ name: 'start_price', type: 'int', default: 0, nullable: false })
  startPrice: number;

  @Column({ type: 'timestamptz', nullable: true })
  deadline?: Date;
}
