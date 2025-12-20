import { Column, Entity } from 'typeorm';
import { BaseTimestampEntity } from '../../common/base.entity.js';

@Entity('maps')
export class Map extends BaseTimestampEntity {
  @Column({ type: 'varchar', length: 500, nullable: false })
  imageUrl: string;
}
