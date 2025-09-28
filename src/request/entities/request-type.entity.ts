import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Request } from './request.entity';

@Entity('request_types')
export class RequestType extends BaseEntity {
  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  requiresManagerApproval: boolean;

  @Column({ default: false })
  requiresHrApproval: boolean;

  @Column({ default: 30 })
  maxAdvanceDays: number;

  @OneToMany(() => Request, (request) => request.requestType)
  requests: Request[];
}
