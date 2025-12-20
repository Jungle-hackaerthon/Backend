import { Column, Entity, OneToMany } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';
import { User } from '../users/user.entity';

@Entity('maps')
export class Map extends BaseTimestampEntity {
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  imageUrl: string;

  @OneToMany(() => User, (user) => user.currentMap)
  users: User[];
}
