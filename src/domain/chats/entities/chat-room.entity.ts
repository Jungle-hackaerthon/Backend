import { BaseTimestampEntity } from 'src/common/base.entity';
import { User } from 'src/domain/users/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('chat_rooms')
export class ChatRoom extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2_id' })
  user2: User;
}
