import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../domain/users/user.entity';
import { BaseTimestampEntity } from '../../common/base.entity.js';

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
