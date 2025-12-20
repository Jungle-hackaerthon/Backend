import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 1000 })
  width: number;

  @Column({ type: 'int', default: 1000 })
  height: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // TODO: 추가 필드
  // - description
  // - backgroundImage
  // - maxUsers
  // - 관계: posts (OneToMany)
  // - 관계: currentUsers (OneToMany to User) 또는 별도 테이블
}
