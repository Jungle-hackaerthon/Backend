import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ChatRoom } from './chat-room.entity';
import { BaseTimestampEntity } from 'src/common/base.entity';
import { User } from 'src/domain/users/user.entity';

@Entity('messages')
export class Message extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true }) // Preserve messages when user is deleted, set sender to null
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatRoom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'message_type', type: 'varchar', default: 'TEXT' })
  messageType: string;
}
