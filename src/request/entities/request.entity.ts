import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Employee } from '../../employee/entities/employee.entity';
import { RequestType } from './request-type.entity';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('requests')
export class Request extends BaseEntity {
  @ManyToOne(() => Employee, (employee) => employee.requests)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => RequestType, (requestType) => requestType.requests)
  @JoinColumn({ name: 'requestTypeId' })
  requestType: RequestType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  managerApprovalStatus: ApprovalStatus;

  @Column({ nullable: true })
  managerApprovalDate: Date;

  @Column({ type: 'text', nullable: true })
  managerApprovalComment: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  hrApprovalStatus: ApprovalStatus;

  @Column({ nullable: true })
  hrApprovalDate: Date;

  @Column({ type: 'text', nullable: true })
  hrApprovalComment: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approvedByManagerId' })
  approvedByManager: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approvedByHrId' })
  approvedByHr: Employee;

  @Column({ nullable: true })
  totalDays: number;

  @Column({ nullable: true })
  totalHours: number;
}
