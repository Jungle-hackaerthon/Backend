import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../domain/users/user.entity';

@Entity('messages')
export class Message extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
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
