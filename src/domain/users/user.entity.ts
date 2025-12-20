import { Column, Entity, UpdateDateColumn } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity';

@Entity('users')
export class User extends BaseTimestampEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  nickname: string;

  @Column({ name: 'hashed_password' })
  hashedPassword: string;

  @Column({ name: 'avatar_url', default: 'default-avatar.png' })
  avatarUrl: string;

  @Column({ name: 'point_balance', type: 'int', default: 0 })
  pointBalance: number;

  @Column({ name: 'x_position', type: 'double precision', nullable: true })
  xPosition?: number;

  @Column({ name: 'y_position', type: 'double precision', nullable: true })
  yPosition?: number;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    type: 'timestamp with time zone',
  })
  updatedAt?: Date;

  // 관계는 단방향으로 다른 엔티티에서만 매핑합니다.
}
