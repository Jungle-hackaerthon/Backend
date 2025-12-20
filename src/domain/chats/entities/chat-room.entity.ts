import { BaseTimestampEntity } from '../../../common/base.entity';
import { User } from '../../users/user.entity';
import { Entity, JoinColumn, ManyToOne, Column, Index } from 'typeorm';

export enum ReferenceType {
  PRODUCT = 'PRODUCT',
  REQUEST = 'REQUEST',
  GENERAL = 'GENERAL',
}

@Entity('chat_rooms')
//@Index(['user1', 'user2', 'referenceType', 'referenceId'], { unique: true })
export class ChatRoom extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  @Column({
    type: 'enum',
    enum: ReferenceType,
    default: ReferenceType.GENERAL,
  })
  referenceType: ReferenceType;

  @Column({ type: 'varchar', nullable: true })
  referenceId: string | null;
}
