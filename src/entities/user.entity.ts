import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ default: 1000 })
  points: number;

  @Column({ nullable: true })
  avatarUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: 추가 필드
  // - 현재 위치 (x, y, roomId)
  // - 온라인 상태
  // - 관계: posts (OneToMany)
  // - 관계: dmThreads (ManyToMany)
  // - 관계: dmMessages (OneToMany)
}
