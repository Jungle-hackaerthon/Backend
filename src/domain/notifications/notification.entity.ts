import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { BaseTimestampEntity } from '../../common/base.entity.js';

@Entity('notifications')
export class Notification extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'notification_type', type: 'varchar' })
  notificationType: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_sent_email', default: false })
  isSentEmail: boolean;
}
