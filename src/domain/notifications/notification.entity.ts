import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';
import { User } from '../users/user.entity.js';
import { NotificationEventType } from '../../common/constants/notification-event-type.js';

@Entity('notifications')
export class Notification extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    name: 'notification_type',
    type: 'varchar',
    length: 30,
    default: NotificationEventType.CHAT_MESSAGE,
  })
  notificationType: NotificationEventType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;
}
