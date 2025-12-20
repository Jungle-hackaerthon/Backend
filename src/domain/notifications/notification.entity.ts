import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';
import { User } from '../users/user.entity.js';

@Entity('notifications')
export class Notification extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;
}
