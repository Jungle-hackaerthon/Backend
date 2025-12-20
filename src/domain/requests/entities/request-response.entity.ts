import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampEntity } from '../../../common/base.entity';
import { Request } from './request.entity';
import { User } from '../../users/user.entity';

@Entity('request_responses')
export class RequestResponse extends BaseTimestampEntity {
  @ManyToOne(() => Request, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'helper_id' })
  helper: User;

  @Column({ name: 'proposed_price', type: 'int', nullable: true })
  proposedPrice?: number;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  // createdAt is inherited
}
