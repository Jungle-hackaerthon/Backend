import { Column, Entity, UpdateDateColumn } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';

@Entity('rooms')
export class Room extends BaseTimestampEntity {
  @Column()
  name: string;

  @Column({ type: 'int', default: 1000 })
  width: number;

  @Column({ type: 'int', default: 1000 })
  height: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
