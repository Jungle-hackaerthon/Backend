import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: 추가 필드
  // - 첨부파일
  // - 좋아요 수
  // - 조회 수
  // - 관계: author (ManyToOne to User)
  // - 관계: room (ManyToOne to Room)
  // - 관계: comments (OneToMany) if needed
}
