import { BaseTimestampEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('chat_rooms')
export class ChatRoom extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user2_id' })
  user2: User;
}
