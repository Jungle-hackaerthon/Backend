import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { BaseTimestampEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';

@Entity('requests')
export class Request extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'proposed_price', type: 'int', default: 0 })
  proposedPrice: number;

  @Column({ type: 'timestamptz', nullable: true })
  deadline?: Date;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp with time zone',
  })
  updatedAt?: Date;
}
