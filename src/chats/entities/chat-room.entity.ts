import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../domain/users/user.entity';
import { BaseTimestampEntity } from '../../common/base.entity.js';

@Entity('chat_rooms')
export class ChatRoom extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2_id' })
  user2: User;
}
