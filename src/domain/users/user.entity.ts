import { Column, Entity } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';

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

  @Column({ name: 'current_map', type: 'int', nullable: true })
  currentMap?: number;
}
