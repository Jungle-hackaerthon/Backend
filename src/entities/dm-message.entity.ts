import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('dm_messages')
export class DmMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  threadId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  // TODO: 추가 필드
  // - 첨부파일
  // - 메시지 타입 (text, image, file 등)
  // - 관계: thread (ManyToOne to DmThread)
  // - 관계: sender (ManyToOne to User)
  // - 읽음 여부 (readBy 배열 또는 별도 테이블)
}
