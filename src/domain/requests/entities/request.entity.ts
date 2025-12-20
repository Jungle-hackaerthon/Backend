import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';
import { BaseTimestampEntity } from '../../../common/base.entity';

export enum RequestStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('requests')
export class Request extends BaseTimestampEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'proposed_price', type: 'int', default: 0 })
  proposedPrice: number;

  @Column({ type: 'timestamptz', nullable: true })
  deadline?: Date;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.IN_PROGRESS,
    nullable: false,
  })
  status: RequestStatus;

  @Column({ name: 'x_position', type: 'int', nullable: false })
  xPosition: number;

  @Column({ name: 'y_position', type: 'int', nullable: false })
  yPosition: number;

  @Column({ name: 'map_id', type: 'int', nullable: false })
  mapId: number;
}
