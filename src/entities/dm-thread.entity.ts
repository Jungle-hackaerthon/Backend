import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dm_threads')
export class DmThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  participantIds: string[]; // [userId1, userId2]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: 추가 필드
  // - lastMessageAt
  // - 관계: participants (ManyToMany to User)
  // - 관계: messages (OneToMany to DmMessage)
  // - 읽음 상태 관리 (별도 테이블 또는 JSON 필드)
}
